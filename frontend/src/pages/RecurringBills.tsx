import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { format, addMonths, subMonths, isPast, isToday, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Edit2, Trash2, Calendar, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import TransactionForm from '../components/transactions/TransactionForm';
import { getIconComponent } from '../lib/icons';

interface Category {
    id: string;
    title: string;
    type: string;
    icon: string;
    parent_category_id: string | null;
    subcategories: Category[];
}

interface RecurringBill {
    id: string;
    title: string;
    amount: number;
    frequency: 'monthly' | 'yearly';
    day_of_month: number;
    month_of_year?: number;
    category_id: string;
    category?: Category;
}

interface BillStatus {
    bill: RecurringBill;
    status: 'PAID' | 'UNPAID';
    amount_paid: number;
}

const RecurringBills: React.FC = () => {
    const queryClient = useQueryClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [payingBill, setPayingBill] = useState<RecurringBill | null>(null);

    // Fetch Bills & Status
    const { data: billStatuses = [] } = useQuery<BillStatus[]>({
        queryKey: ['recurring-status', currentDate.getFullYear(), currentDate.getMonth()],
        queryFn: async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const res = await api.get(`/recurring?year=${year}&month=${month}`);
            return res.data;
        }
    });

    // Fetch Categories
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        const traverse = (cats: Category[]) => {
            cats.forEach(c => {
                map.set(c.id, c);
                if (c.subcategories) traverse(c.subcategories);
            });
        };
        traverse(categories);
        return map;
    }, [categories]);

    // Mutations
    const payMutation = useMutation({
        mutationFn: async (txData: any) => api.post('/transactions', txData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setPayingBill(null);
        }
    });

    const createBillMutation = useMutation({
        mutationFn: async (data: any) => api.post('/recurring', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            setIsFormOpen(false);
        }
    });

    const updateBillMutation = useMutation({
        mutationFn: async (data: any) => api.put(`/recurring/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            setIsFormOpen(false);
        }
    });

    const deleteBillMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/recurring/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            setDeleteId(null);
        }
    });

    // Calculations
    const totalProjected = billStatuses.reduce((sum, item) => sum + item.bill.amount, 0);
    const totalPaid = billStatuses.filter(i => i.status === 'PAID').reduce((sum, item) => sum + item.bill.amount, 0); // Using bill amount as paid approximation or amount_paid
    // Actually amount_paid might be accurate from backend if partial payments allowed? reusing bill.amount for consistency in projection unless amount_paid > 0
    const remaining = totalProjected - totalPaid;
    const progress = totalProjected > 0 ? (totalPaid / totalProjected) * 100 : 0;

    // Grouping
    const upcomingBills = billStatuses.filter(b => b.status === 'UNPAID').sort((a, b) => a.bill.day_of_month - b.bill.day_of_month);
    const paidBills = billStatuses.filter(b => b.status === 'PAID').sort((a, b) => a.bill.day_of_month - b.bill.day_of_month);

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    };

    const openAddBill = () => {
        setEditingBill(null);
        setIsFormOpen(true);
    };

    // Helper specific to this component's rendering
    const renderBillRow = (item: BillStatus) => {
        const { bill, status } = item;
        const cat = categoryMap.get(bill.category_id);
        let CatIcon = Calendar;
        let catName = "Uncategorized";
        let parentName = "";

        if (cat) {
            CatIcon = getIconComponent(cat.icon);
            catName = cat.title;
            if (cat.parent_category_id) {
                const parent = categoryMap.get(cat.parent_category_id);
                if (parent) parentName = parent.title;
            }
        }

        // Due Date Logic
        const billDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), bill.day_of_month);
        const isOverdue = status === 'UNPAID' && isPast(billDate) && !isToday(billDate);
        const isDueSoon = status === 'UNPAID' && !isOverdue && differenceInDays(billDate, new Date()) <= 3 && differenceInDays(billDate, new Date()) >= 0;

        return (
            <div key={bill.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-md transition-all relative overflow-hidden">
                {/* Status Color Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'PAID' ? 'bg-green-500' : isOverdue ? 'bg-red-500' : isDueSoon ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`} />

                {/* Icon */}
                <div className={`w-12 h-12 ml-2 rounded-xl flex items-center justify-center flex-shrink-0 ${status === 'PAID' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    <CatIcon className="w-6 h-6" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-base">{bill.title}</h4>
                        {parentName && (
                            <span className="text-xs text-gray-400 hidden sm:inline-flex items-center">
                                • {parentName} {'>'} {catName}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-sm">
                        {status === 'PAID' ? (
                            <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Paid
                            </span>
                        ) : (
                            <span className={`font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                                {isDueSoon && <Clock className="w-3.5 h-3.5" />}
                                {isOverdue ? 'Overdue' : 'Due'} {format(billDate, 'MMM do')}
                            </span>
                        )}
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{bill.frequency}</span>
                    </div>
                </div>

                {/* Actions & Amount */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className={`text-lg font-bold ${status === 'PAID' ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-900 dark:text-white'}`}>
                            ${bill.amount.toLocaleString()}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {status === 'UNPAID' && (
                            <button
                                onClick={() => setPayingBill(bill)}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                            >
                                Pay
                            </button>
                        )}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingBill(bill); setIsFormOpen(true); }} className="p-1 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteId(bill.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header / Month Nav */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Recurring Bills</h1>
                    <p className="text-gray-500 text-sm mt-1">Keep track of your monthly subscriptions.</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <button onClick={() => handleMonthChange('prev')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-base font-bold min-w-[140px] text-center text-gray-900 dark:text-white">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => handleMonthChange('next')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-blue-100 text-sm font-medium mb-1">Total Projected</div>
                        <div className="text-3xl font-bold">${totalProjected.toLocaleString()}</div>
                        <div className="mt-4 flex items-center gap-2 text-blue-200 text-xs">
                            <Calendar className="w-4 h-4" /> For {format(currentDate, 'MMMM')}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4">
                        <Calendar className="w-32 h-32" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Paid so far</div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">${totalPaid.toLocaleString()}</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="mt-2 text-right text-xs text-gray-400">{Math.round(progress)}% Paid</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group" onClick={openAddBill}>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">Add Subscription</div>
                    <div className="text-xs text-gray-500 mt-1">Track a new monthly bill</div>
                </div>
            </div>

            {/* List Sections */}
            <div className="space-y-8">
                {/* Upcoming */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        Upcoming & Unpaid
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{upcomingBills.length}</span>
                    </h3>
                    <div className="flex flex-col gap-3">
                        {upcomingBills.length > 0 ? upcomingBills.map(renderBillRow) : (
                            <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                No upcoming bills! 🎉
                            </div>
                        )}
                    </div>
                </div>

                {/* Paid */}
                {paidBills.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 opacity-75">
                            Completed
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">{paidBills.length}</span>
                        </h3>
                        <div className="flex flex-col gap-3 opacity-75 hover:opacity-100 transition-opacity">
                            {paidBills.map(renderBillRow)}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals remain mostly same */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingBill ? "Edit" : "Add Bill"} size="4xl">
                <TransactionForm
                    key={editingBill ? editingBill.id : 'new-bill'}
                    type="expense"
                    initialData={editingBill ? { ...editingBill, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), editingBill.day_of_month).toISOString() } : undefined}
                    onCancel={() => setIsFormOpen(false)}
                    onSubmit={(data) => {
                        const payload = { ...data, frequency: 'monthly', day_of_month: new Date(data.date).getDate(), month_of_year: null };
                        editingBill ? updateBillMutation.mutate({ ...payload, id: editingBill.id }) : createBillMutation.mutate(payload);
                    }}
                    submitLabel={editingBill ? "Update" : "Create"}
                    isSubmitting={createBillMutation.isPending || updateBillMutation.isPending}
                />
            </Modal>

            <Modal isOpen={!!payingBill} onClose={() => setPayingBill(null)} title={`Pay ${payingBill?.title}`} size="4xl">
                {payingBill && (
                    <TransactionForm
                        key={`pay-${payingBill.id}`}
                        type="expense"
                        initialData={{ amount: payingBill.amount, title: payingBill.title, category_id: payingBill.category_id, date: new Date().toISOString() }}
                        onCancel={() => setPayingBill(null)}
                        onSubmit={(data) => payMutation.mutate(data)}
                        submitLabel="Confirm Payment"
                        isSubmitting={payMutation.isPending}
                    />
                )}
            </Modal>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm" size="md">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">Are you sure you want to stop tracking this bill?</p>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={() => deleteBillMutation.mutate(deleteId!)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RecurringBills;
