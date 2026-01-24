import React, { useState } from 'react';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


// Validation Schema
const categorySchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    type: z.enum(["income", "expense"]),
    id: z.string().optional(), // For editing identification or manual slug override?
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
            type: 'expense'
        }
    });

    const currentType = watch('type');

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
                // Update
                return await api.patch(`/categories/${editingCategory.id}`, { title: data.title, type: data.type });
            } else {
                // Create
                // Generate slug ID if not present
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
        reset({ title: '', type: 'expense' });
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setValue('title', cat.title);
        setValue('type', cat.type);
        setIsModalOpen(true);
    };

    const onSubmit = (data: CategoryFormData) => {
        mutation.mutate(data);
    };

    const incomeCategories = categories?.filter((c: Category) => c.type === 'income') || [];
    const expenseCategories = categories?.filter((c: Category) => c.type === 'expense') || [];

    const CategoryCard = ({ category }: { category: Category }) => (
        <div className="group flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${category.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">{category.title}</h3>
                </div>
            </div>
            <button
                onClick={() => handleEdit(category)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="Edit Category"
            >
                <Edit2 className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your income and expense categories</p>
                </div>
                <button
                    onClick={() => { reset({ title: '', type: 'expense' }); setEditingCategory(null); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-600/20 font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expense Column */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <div className="w-4 h-4 bg-red-500 rounded-full" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense</h2>
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                            {expenseCategories.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {expenseCategories.map((cat: Category) => (
                            <CategoryCard key={cat.id} category={cat} />
                        ))}
                        {expenseCategories.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <p className="text-gray-500">No expense categories yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Income Column */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <div className="w-4 h-4 bg-green-500 rounded-full" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Income</h2>
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                            {incomeCategories.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {incomeCategories.map((cat: Category) => (
                            <CategoryCard key={cat.id} category={cat} />
                        ))}
                        {incomeCategories.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <p className="text-gray-500">No income categories yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? "Edit Category" : "New Category"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* Only show Type selection when creating new, or ideally allow changing? */}
                    {/* Usually changing type of category with transactions is risky. Let's allow for now. */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`
                                cursor-pointer relative flex items-center justify-center p-3 rounded-lg border-2 transition-all
                                ${currentType === 'expense'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                            `}>
                                <input
                                    type="radio"
                                    value="expense"
                                    {...register('type')}
                                    className="sr-only"
                                />
                                <span className="font-medium">Expense</span>
                            </label>

                            <label className={`
                                cursor-pointer relative flex items-center justify-center p-3 rounded-lg border-2 transition-all
                                ${currentType === 'income'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                            `}>
                                <input
                                    type="radio"
                                    value="income"
                                    {...register('type')}
                                    className="sr-only"
                                />
                                <span className="font-medium">Income</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            {...register('title')}
                            className={`
                                block w-full rounded-xl border-gray-300 shadow-sm 
                                focus:border-blue-500 focus:ring-blue-500 
                                py-2.5 px-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 
                                dark:border-gray-600 transition-colors
                                ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                            `}
                            placeholder="e.g., Groceries, Rent, Salary"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="mr-3 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-600/20"
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
