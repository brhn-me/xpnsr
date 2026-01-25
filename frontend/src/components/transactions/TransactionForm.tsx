import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Calculator from '../Calculator';
import { getIconComponent } from '../../lib/icons';

interface Category {
    id: string;
    title: string;
    type: string;
    icon: string;
    parent_category_id: string | null;
    subcategories: Category[];
}

interface TransactionFormProps {
    type: 'income' | 'expense';
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
    type,
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitLabel = "Save"
}) => {
    // Form State
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
    const [showDetails, setShowDetails] = useState(false);

    // Fetch Categories
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const activeCategories = useMemo(() => {
        return categories.filter((c: Category) => c.type === type);
    }, [categories, type]);

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

    // Populate form if initialData provided
    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');

            if (initialData.date) {
                const dt = new Date(initialData.date);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toTimeString().split(' ')[0].slice(0, 5));
            }

            const cat = categoryMap.get(initialData.category_id);
            if (cat) {
                setCategoryId(cat.id);
                if (cat.parent_category_id) {
                    setSelectedParentId(cat.parent_category_id);
                } else {
                    setSelectedParentId(cat.id);
                }
            }

            if (initialData.title || initialData.description) {
                setShowDetails(true);
            }
        }
    }, [initialData, categoryMap]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Evaluate amount
        let finalAmount = 0;
        try {
            if (/[+\-*/]/.test(amount)) {
                // simple sanitize
                // eslint-disable-next-line no-new-func
                const sanitized = amount.replace(/[^0-9+\-*/().]/g, '');
                const res = new Function('return ' + sanitized)();
                finalAmount = parseFloat(res);
            } else {
                finalAmount = parseFloat(amount);
            }
        } catch (e) {
            alert("Invalid amount format");
            return;
        }

        if (isNaN(finalAmount)) {
            alert("Please enter a valid amount");
            return;
        }

        const combined = new Date(`${date}T${time}:00`).toISOString();

        onSubmit({
            amount: parseFloat(finalAmount.toFixed(2)),
            title,
            description,
            type,
            category_id: categoryId,
            date: combined
        });
    };

    // --- Components ---
    const CategoryGrid = () => {
        return (
            <div className="grid grid-cols-5 gap-2">
                {activeCategories.map((cat) => {
                    const Icon = getIconComponent(cat.icon);
                    const isSelected = selectedParentId === cat.id;

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                                setSelectedParentId(cat.id);
                                setCategoryId(cat.id); // Default to parent
                            }}
                            className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-2 transition-all ${isSelected
                                ? `border-${type === 'income' ? 'green' : 'red'}-500 bg-${type === 'income' ? 'green' : 'red'}-50 dark:bg-${type === 'income' ? 'green' : 'red'}-900/20`
                                : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`p-1.5 rounded-full mb-1 ${isSelected
                                ? `bg-${type === 'income' ? 'green' : 'red'}-100 text-${type === 'income' ? 'green' : 'red'}-600`
                                : 'bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                }`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-medium text-center truncate w-full ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {cat.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const SubcategoryGrid = () => {
        const parent = activeCategories.find(c => c.id === selectedParentId);
        if (!parent || !parent.subcategories || parent.subcategories.length === 0) return null;

        return (
            <div className="animate-fadeIn mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-2">
                    {parent.subcategories.map((sub) => {
                        const Icon = getIconComponent(sub.icon);
                        const isSelected = categoryId === sub.id;
                        return (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => setCategoryId(sub.id)}
                                className={`flex items-center p-2 rounded-lg border transition-all ${isSelected
                                    ? `bg-${type === 'income' ? 'green' : 'red'}-50 border-${type === 'income' ? 'green' : 'red'}-200`
                                    : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                                    }`}
                            >
                                <div className={`p-1 rounded-full mr-2 ${isSelected
                                    ? `bg-white text-${type === 'income' ? 'green' : 'red'}-600`
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className={`text-xs truncate ${isSelected ? `text-${type === 'income' ? 'green' : 'red'}-900` : 'text-gray-700 dark:text-gray-200'
                                    }`}>
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
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* LEFT COLUMN */}
                <div className="md:col-span-3 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 px-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 px-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                        <CategoryGrid />
                        <SubcategoryGrid />
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
                        >
                            {showDetails ? '- Hide details' : '+ More Details'}
                        </button>
                    </div>

                    {showDetails && (
                        <div className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title <span className="text-gray-400 font-normal lowercase">(optional)</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Lunch at Joe's"
                                    className="block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 px-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Note <span className="text-gray-400 font-normal lowercase">(optional)</span></label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add extra details..."
                                    className="block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 px-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-400 resize-none h-24"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-500 text-lg font-bold z-10">$</span>
                            <input
                                type="text"
                                required
                                value={amount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[0-9+\-*/().\s]*$/.test(val)) {
                                        setAmount(val);
                                    }
                                }}
                                className="block w-full rounded-2xl border-gray-200 bg-gray-50 pl-9 pr-4 focus:border-blue-500 focus:ring-blue-500 text-2xl py-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white font-bold tracking-tight text-right shadow-inner"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <Calculator value={amount} onChange={setAmount} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8 gap-3 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${type === 'income'
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30 hover:shadow-green-500/40'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-500/30 hover:shadow-red-500/40'
                        }`}
                >
                    {isSubmitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;
