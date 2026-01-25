
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { format, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, PieChart } from 'lucide-react';
import { getIconComponent } from '../lib/icons';
import Modal from '../components/Modal';

interface Budget {
    id: string;
    category_id: string;
    amount: number;
    month: number;
    year: number;
    spent: number;
    percentage: number;
}

interface Category {
    id: string;
    title: string;
    type: string;
    icon: string;
    color: string;
    parent_category_id: string | null;
    subcategories: Category[];
}

const Budgets: React.FC = () => {
    const queryClient = useQueryClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    // Form State
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedParentId, setSelectedParentId] = useState<string>('');

    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Fetch Budgets
    const { data: budgets = [] } = useQuery<Budget[]>({
        queryKey: ['budgets', month, year],
        queryFn: async () => {
            const res = await api.get(`/budgets?month=${month}&year=${year}`);
            return res.data;
        }
    });

    // Fetch Categories
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        }
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

    const getCategory = (id: string) => categoryMap.get(id);

    // Filter Expense Categories
    const expenseCategories = useMemo(() => {
        return categories.filter((c: Category) => c.type === 'expense');
    }, [categories]);

    const upsertMutation = useMutation({
        mutationFn: (data: any) => api.post('/budgets', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            setIsFormOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/budgets/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        if (!selectedCategoryId) {
            alert("Please select a category");
            return;
        }

        upsertMutation.mutate({
            category_id: selectedCategoryId,
            amount: parseFloat(formData.get('amount') as string),
            month,
            year
        });
    };

    const openSetBudget = (budget?: Budget) => {
        setEditingBudget(budget || null);
        if (budget) {
            setSelectedCategoryId(budget.category_id);
            // Find parent for initial selection
            const cat = categoryMap.get(budget.category_id);
            if (cat) {
                setSelectedParentId(cat.parent_category_id || cat.id);
            }
        } else {
            setSelectedCategoryId('');
            setSelectedParentId('');
        }
        setIsFormOpen(true);
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 80) return 'bg-amber-500';
        return 'bg-green-500';
    };

    // Category Picker Components
    const CategoryGrid = () => {
        return (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {expenseCategories.map((cat) => {
                    const Icon = getIconComponent(cat.icon);
                    const isSelected = selectedParentId === cat.id;

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                                setSelectedParentId(cat.id);
                                setSelectedCategoryId(cat.id);
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${isSelected
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`p-1.5 rounded-full mb-1 ${isSelected
                                ? 'bg-red-100 text-red-600'
                                : 'bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-medium text-center truncate w-full ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {cat.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const SubcategoryGrid = () => {
        const parent = expenseCategories.find(c => c.id === selectedParentId);
        if (!parent || !parent.subcategories || parent.subcategories.length === 0) return null;

        return (
            <div className="animate-fadeIn mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {parent.subcategories.map((sub) => {
                        const Icon = getIconComponent(sub.icon);
                        const isSelected = selectedCategoryId === sub.id;
                        return (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => setSelectedCategoryId(sub.id)}
                                className={`flex items-center p-2 rounded-lg border transition-all ${isSelected
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                                    }`}
                            >
                                <div className={`p-1 rounded-full mr-2 ${isSelected
                                    ? 'bg-white text-red-600'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className={`text-xs truncate ${isSelected ? 'text-red-900' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {sub.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Budgets</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Plan and track your monthly spending.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white w-32 text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <button onClick={() => openSetBudget()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    <Plus className="w-5 h-5 mr-2" />
                    Set Budget
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map(budget => {
                    const category = getCategory(budget.category_id);
                    if (!category) return null;
                    const Icon = getIconComponent(category.icon);
                    const remaining = budget.amount - budget.spent;
                    const isOver = remaining < 0;

                    return (
                        <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{category.title}</h3>
                                        <div className="text-xs text-gray-500 flex gap-1">
                                            <span>Limit: ${budget.amount}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${isOver ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                        ${budget.spent.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-400">spent</div>
                                </div>
                            </div>

                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between text-xs font-medium">
                                <span className={`${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                                    {Math.round(budget.percentage)}%
                                </span>
                                <span className={`${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                                    {isOver ? `Over by $${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()} left`}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                <button onClick={() => openSetBudget(budget)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteMutation.mutate(budget.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    );
                })}

                {budgets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <PieChart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No budgets set for {format(currentDate, 'MMMM yyyy')}</p>
                        <button onClick={() => openSetBudget()} className="mt-4 text-blue-600 hover:underline font-medium">Set your first budget</button>
                    </div>
                )}
            </div>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingBudget ? "Edit Budget" : "Set Budget"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category</label>
                        {/* Replaced Select with Grid Picker */}
                        <CategoryGrid />
                        <SubcategoryGrid />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Limit</label>
                        <div className="relative">
                            <span className="absolute left-4 top-2.5 text-gray-400">$</span>
                            <input type="number" step="0.01" name="amount" defaultValue={editingBudget?.amount} required className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">Save Budget</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Budgets;
