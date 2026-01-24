import React, { useState } from 'react';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Edit2, Home, Utensils, ShoppingBag, Car,
    Smartphone, Heart, Zap, Briefcase, Wallet,
    DollarSign, Coffee, Tv, Plane, Gift, GraduationCap,
    ArrowDownCircle, ArrowUpCircle, ShoppingCart
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
    'home': Home,
    'utensils': Utensils,
    'shopping-bag': ShoppingBag,
    'car': Car,
    'smartphone': Smartphone,
    'heart': Heart,
    'zap': Zap,
    'briefcase': Briefcase,
    'wallet': Wallet,
    'dollar-sign': DollarSign,
    'coffee': Coffee,
    'tv': Tv,
    'plane': Plane,
    'gift': Gift,
    'graduation-cap': GraduationCap
};

const ICONS_LIST = Object.keys(ICON_MAP);

// Validation Schema
const categorySchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    type: z.enum(["income", "expense"]),
    icon: z.string().optional(),
    id: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
    id: string;
    title: string;
    type: 'income' | 'expense';
    icon?: string;
    subcategories?: Category[];
    parent_category_id?: string | null;
}

const Categories: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { register, handleSubmit, reset, watch, formState: { errors }, setValue } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            title: '',
            type: 'expense',
            icon: 'shopping-bag'
        }
    });

    const currentIcon = watch('icon');

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const mutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
            if (editingCategory) {
                return await api.patch(`/categories/${editingCategory.id}`, {
                    title: data.title,
                    type: data.type,
                    icon: data.icon
                });
            } else {
                const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return await api.post('/categories', { ...data, id: slug });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleCloseModal();
        },
        onError: (error: any) => {
            alert("Error saving category: " + (error.response?.data?.detail || error.message));
        }
    });

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        reset({ title: '', type: 'expense', icon: 'shopping-bag' });
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setValue('title', cat.title);
        setValue('type', cat.type);
        setValue('icon', cat.icon || 'shopping-bag');
        setIsModalOpen(true);
    };

    const handleAdd = (type: 'income' | 'expense') => {
        reset({ title: '', type, icon: 'shopping-bag' });
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const onSubmit = (data: CategoryFormData) => {
        mutation.mutate(data);
    };

    const incomeCategories = categories?.filter((c: Category) => c.type === 'income') || [];
    const expenseCategories = categories?.filter((c: Category) => c.type === 'expense') || [];

    const CategoryCard = ({ category }: { category: Category }) => {
        const IconComponent = category.icon && ICON_MAP[category.icon] ? ICON_MAP[category.icon] : ShoppingCart;

        return (
            <div className="group flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl ${category.type === 'income' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                        <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{category.title}</h3>
                    </div>
                </div>
                <button
                    onClick={() => handleEdit(category)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    title="Edit Category"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Categories</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-lg">Manage your income and expense categories</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Expense Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <ArrowDownCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Expenses</h2>
                        </div>
                        <button
                            onClick={() => handleAdd('expense')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="Add Expense Category"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {expenseCategories.map((cat: Category) => (
                            <CategoryCard key={cat.id} category={cat} />
                        ))}
                        {expenseCategories.length === 0 && (
                            <div className="p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                                <p className="text-gray-500 font-medium">No expense categories yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Income Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <ArrowUpCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Income</h2>
                        </div>
                        <button
                            onClick={() => handleAdd('income')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="Add Income Category"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {incomeCategories.map((cat: Category) => (
                            <CategoryCard key={cat.id} category={cat} />
                        ))}
                        {incomeCategories.length === 0 && (
                            <div className="p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                                <p className="text-gray-500 font-medium">No income categories yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? "Update Category" : "Create Category"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Icon Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Icon</label>
                        <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto">
                            {ICONS_LIST.map((iconName) => {
                                const Icon = ICON_MAP[iconName];
                                const isSelected = currentIcon === iconName;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setValue('icon', iconName)}
                                        className={`
                                            p-3 flex items-center justify-center rounded-xl transition-all
                                            ${isSelected
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110 z-10'
                                                : 'text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-600 hover:shadow-sm'}
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                        <input
                            type="text"
                            {...register('title')}
                            className={`
                                block w-full rounded-2xl border-gray-100 shadow-sm 
                                focus:border-blue-500 focus:ring-blue-500 
                                py-4 px-5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 
                                dark:border-gray-700 transition-all font-medium
                                ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                            `}
                            placeholder="e.g., Groceries, Rent, Salary"
                        />
                        {errors.title && (
                            <p className="mt-2 text-sm font-bold text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                        >
                            {editingCategory ? "Save Changes" : "Create Category"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
