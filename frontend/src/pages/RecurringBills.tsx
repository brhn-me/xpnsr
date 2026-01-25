import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Edit2, Trash2 } from 'lucide-react';
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

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch Bills & Status
    const { data: billStatuses = [] } = useQuery<BillStatus[]>({
        queryKey: ['recurring-status', currentDate.getFullYear(), currentDate.getMonth()],
        queryFn: async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // 1-indexed
            const res = await api.get(`/recurring?year=${year}&month=${month}`);
            return res.data;
        }
    });

    // Pay Bill Mutation (create transaction)
    const payMutation = useMutation({
        mutationFn: async (txData: any) => api.post('/transactions', txData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            // Should verify if we need to invalidate transactions too? Probably yes.
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setIsFormOpen(false); // If opened via manual pay form
        }
    });

    // Create Bill Mutation
    const createBillMutation = useMutation({
        mutationFn: async (data: any) => api.post('/recurring', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            setIsFormOpen(false);
        }
    });

    // Update Bill Mutation
    const updateBillMutation = useMutation({
        mutationFn: async (data: any) => api.put(`/recurring/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            setIsFormOpen(false);
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

    // Flatten categories for easy lookup
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

    // Delete Bill Mutation
    const deleteBillMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/recurring/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-status'] });
            setDeleteId(null);
        }
    });

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    };

    // When clicking "Add Bill"
    const openAddBill = () => {
        setEditingBill(null);
        setIsFormOpen(true);
    };

    // When clicking "Pay" on a card
    const [payingBill, setPayingBill] = useState<RecurringBill | null>(null);

    const openPayModal = (bill: RecurringBill) => {
        setPayingBill(bill);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Recurring Bills</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage subscriptions and recurring payments.</p>
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

                <button
                    onClick={openAddBill}
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Bill
                </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4">
                {billStatuses.map(({ bill, status }) => {
                    const cat = categoryMap.get(bill.category_id);
                    let CatIcon = CheckCircle;
                    let catName = "Uncategorized";
                    let parentName = "";
                    let ParentIcon = null;

                    if (cat) {
                        CatIcon = getIconComponent(cat.icon);
                        catName = cat.title;
                        if (cat.parent_category_id) {
                            const parent = categoryMap.get(cat.parent_category_id);
                            if (parent) {
                                parentName = parent.title;
                                ParentIcon = getIconComponent(parent.icon);
                            }
                        }
                    }

                    return (
                        <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex items-center gap-5 group">

                            {/* Left: Category Icon (Subcategory focus) */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${status === 'PAID' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                <CatIcon className="w-7 h-7" />
                            </div>

                            {/* Middle: Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{bill.title}</h3>
                                    {status === 'PAID' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3" /> Paid
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                                    {status !== 'PAID' && (
                                        <span className="font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded-md text-xs">
                                            Due {bill.day_of_month}{getOrdinal(bill.day_of_month)}
                                        </span>
                                    )}

                                    {/* Hierarchy Display */}
                                    {parentName ? (
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                            {ParentIcon && <ParentIcon className="w-3.5 h-3.5" />}
                                            <span className="font-medium">{parentName}</span>
                                            <ChevronRight className="w-3 h-3 text-gray-400" />
                                            <span>{catName}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                            <span className="font-medium">{catName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Actions & Amount */}
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="font-bold text-xl text-gray-900 dark:text-white">${bill.amount}</div>
                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{bill.frequency}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {status === 'UNPAID' && (
                                        <button
                                            onClick={() => openPayModal(bill)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                                        >
                                            Pay
                                        </button>
                                    )}

                                    <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-2 ml-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingBill(bill); setIsFormOpen(true); }}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Edit Bill"
                                        >
                                            <Edit2 className="w-4.5 h-4.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(bill.id); }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete Bill"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {billStatuses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No recurring bills</h3>
                        <p className="text-sm">Add a subscription or bill to get started.</p>
                    </div>
                )}
            </div>

            {/* Bill Definition Modal (Create/Edit) */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingBill ? "Edit Recurring Bill" : "Add Recurring Bill"}
                size="4xl"
            >
                <TransactionForm
                    key={editingBill ? editingBill.id : 'new-bill'}
                    type="expense" // Recurring bills are usually expenses
                    initialData={editingBill ? {
                        ...editingBill,
                        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), editingBill.day_of_month).toISOString()
                    } : undefined}
                    onCancel={() => setIsFormOpen(false)}
                    onSubmit={(data) => {
                        const payload = {
                            title: data.title,
                            amount: data.amount,
                            category_id: data.category_id,
                            frequency: 'monthly',
                            day_of_month: new Date(data.date).getDate(),
                            month_of_year: null // Defaulting to monthly for MVP
                        };

                        if (editingBill) {
                            updateBillMutation.mutate({ ...payload, id: editingBill.id });
                        } else {
                            createBillMutation.mutate(payload);
                        }
                    }}
                    submitLabel={editingBill ? "Update Bill" : "Create Bill"}
                    isSubmitting={createBillMutation.isPending || updateBillMutation.isPending}
                />
            </Modal>

            {/* Pay Bill Modal (Transaction Creation) */}
            <Modal
                isOpen={!!payingBill}
                onClose={() => setPayingBill(null)}
                title={`Pay Bill: ${payingBill?.title}`}
                size="4xl"
            >
                {payingBill && (
                    <TransactionForm
                        key={`pay-${payingBill.id}`}
                        type="expense"
                        initialData={{
                            amount: payingBill.amount,
                            title: payingBill.title,
                            category_id: payingBill.category_id,
                            date: new Date().toISOString() // Default to today for payment
                        }}
                        onCancel={() => setPayingBill(null)}
                        onSubmit={(data) => {
                            payMutation.mutate(data);
                            setPayingBill(null);
                        }}
                        submitLabel="Confirm Payment"
                        isSubmitting={payMutation.isPending}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Confirm Deletion"
                size="md"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-4">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900 dark:text-red-300">Delete this recurring bill?</h4>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                Past transactions won't be deleted, but future tracking will stop.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setDeleteId(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteBillMutation.mutate(deleteId!)}
                            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helper for ordinals (1st, 2nd, 3rd)
function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

export default RecurringBills;
