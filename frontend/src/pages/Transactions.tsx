import React, { useEffect, useState, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { format } from 'date-fns';
import { Search, Filter, Edit2, Trash2, Calendar, FileText, Clock, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

import Modal from '../components/Modal';
import { getIconComponent } from '../lib/icons';

interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    title: string;
    description: string;
    date: string;
    category_id: string;
}

interface Category {
    id: string;
    title: string;
    type: string;
    icon: string;
    parent_category_id: string | null;
    subcategories: Category[];
}

const Transactions: React.FC = () => {
    const [data, setData] = useState<Transaction[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView();
    const queryClient = useQueryClient();

    // Filters
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>(''); // '' = all, 'income', 'expense'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form State
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedParentId, setSelectedParentId] = useState<string>('');

    // Reset parent/category when modal closes or type changes, if not editing
    useEffect(() => {
        if (!isModalOpen) {
            setEditingTx(null);
            resetForm();
        }
    }, [isModalOpen]);

    useEffect(() => {
        // When switching types in Add mode, reset category
        if (!editingTx && isModalOpen) {
            setCategoryId('');
            setSelectedParentId('');
        }
    }, [type]);

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

    // Populate form when editing
    useEffect(() => {
        if (editingTx) {
            setAmount(editingTx.amount.toString());
            setTitle(editingTx.title);
            setDescription(editingTx.description || '');
            setType(editingTx.type);

            // Extract date only
            const dt = new Date(editingTx.date);
            setDate(dt.toISOString().split('T')[0]);

            // Handle Category Pre-selection
            const cat = categoryMap.get(editingTx.category_id);
            if (cat) {
                setCategoryId(cat.id);
                if (cat.parent_category_id) {
                    setSelectedParentId(cat.parent_category_id);
                } else {
                    setSelectedParentId(cat.id);
                }
            }
        }
    }, [editingTx, categoryMap]);

    const fetchTransactions = async (pageParam: number, searchTerm: string, typeFilter: string) => {
        const params = new URLSearchParams();
        params.append('skip', (pageParam * 20).toString());
        params.append('limit', '20');
        if (searchTerm) params.append('search', searchTerm);
        if (typeFilter) params.append('type', typeFilter);

        const res = await api.get(`/transactions?${params.toString()}`);
        return res.data;
    };

    // Initial Load
    useEffect(() => {
        if (page === 0 && data.length === 0) {
            const loadInitial = async () => {
                const newTransactions = await fetchTransactions(0, search, filterType);
                if (newTransactions.length < 20) setHasMore(false);
                setData(newTransactions);
                setPage(1);
            };
            loadInitial();
        }
    }, []);

    // Reset list when filters change
    useEffect(() => {
        const resetAndLoad = async () => {
            setPage(0);
            const newTransactions = await fetchTransactions(0, search, filterType);
            setData(newTransactions);
            setHasMore(newTransactions.length >= 20);
            setPage(1);
        };
        resetAndLoad();
    }, [search, filterType]);

    // Infinite Scroll
    useEffect(() => {
        if (inView && hasMore && page > 0) {
            const loadMore = async () => {
                const newTransactions = await fetchTransactions(page, search, filterType);
                if (newTransactions.length < 20) setHasMore(false);

                setData((prev) => {
                    const newIds = new Set(newTransactions.map((t: Transaction) => t.id));
                    return [...prev.filter(t => !newIds.has(t.id)), ...newTransactions];
                });

                setPage((prev) => prev + 1);
            };
            loadMore();
        }
    }, [inView, hasMore, page, search, filterType]);

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (newTx: any) => api.post('/transactions', newTx),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setData((prev) => [res.data, ...prev]);
            setIsModalOpen(false);
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async (tx: any) => api.put(`/transactions/${tx.id}`, tx),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setData((prev) => prev.map(t => t.id === res.data.id ? res.data : t));
            setIsModalOpen(false);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/transactions/${id}`),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setData((prev) => prev.filter(t => t.id !== id));
            setDeleteId(null);
        }
    });

    const resetForm = () => {
        setAmount('');
        setTitle('');
        setDescription('');
        // setType('expense'); // Don't reset type here as it's set by the button click
        setCategoryId('');
        setSelectedParentId('');
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let finalDate = new Date().toISOString();
        if (editingTx) {
            const originalInfo = new Date(editingTx.date);
            const newDateParts = new Date(date);
            originalInfo.setFullYear(newDateParts.getFullYear(), newDateParts.getMonth(), newDateParts.getDate());
            finalDate = originalInfo.toISOString();
        } else {
            const now = new Date();
            const selected = new Date(date);
            now.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
            finalDate = now.toISOString();
        }

        const payload = {
            amount: parseFloat(amount),
            title: title || 'Untitled',
            description,
            type,
            category_id: categoryId,
            date: finalDate
        };

        if (editingTx) {
            updateMutation.mutate({ ...payload, id: editingTx.id });
        } else {
            createMutation.mutate(payload);
        }
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    // Open Modal with specific Type
    const openAddModal = (initialType: 'income' | 'expense') => {
        setEditingTx(null);
        setType(initialType);
        setIsModalOpen(true);
    };

    const activeCategories = useMemo(() => {
        return categories.filter((c: Category) => c.type === type);
    }, [categories, type]);

    const CustomSelect = ({
        options,
        value,
        onChange,
        placeholder,
        label
    }: {
        options: Category[],
        value: string,
        onChange: (val: string) => void,
        placeholder: string,
        label: string
    }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selected = options.find(o => o.id === value);
        const SelectedIcon = selected ? getIconComponent(selected.icon) : null;

        return (
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm pl-3 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                >
                    <span className="flex items-center">
                        {selected && SelectedIcon ? (
                            <>
                                <SelectedIcon className="flex-shrink-0 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="ml-3 block truncate text-gray-900 dark:text-white">{selected.title}</span>
                            </>
                        ) : (
                            <span className="block truncate text-gray-400">{placeholder}</span>
                        )}
                    </span>
                    <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {options.map((option) => {
                                const Icon = getIconComponent(option.icon);
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => {
                                            onChange(option.id);
                                            setIsOpen(false);
                                        }}
                                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center ${value === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    >
                                        <Icon className="flex-shrink-0 h-4 w-4 text-gray-500 dark:text-gray-400 mr-3" />
                                        <span className={`block truncate ${value === option.id ? 'font-semibold text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {option.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const CategorySelect = () => {
        const parents = activeCategories.filter(c => !c.parent_category_id);
        const parent = categoryMap.get(selectedParentId);
        const subcategories = parent?.subcategories || [];

        const handleParentChange = (pid: string) => {
            setSelectedParentId(pid);
            setCategoryId(pid); // Default to parent ID
        };

        const handleSubChange = (sid: string) => {
            setCategoryId(sid); // Update to sub ID
        };

        return (
            <div className="space-y-4">
                <CustomSelect
                    label="Category"
                    options={parents}
                    value={selectedParentId}
                    onChange={handleParentChange}
                    placeholder="Select Primary Category"
                />

                {subcategories.length > 0 && (
                    <div className="animate-fadeIn">
                        <CustomSelect
                            label="Subcategory (Optional)"
                            options={subcategories}
                            value={categoryId === selectedParentId ? '' : categoryId} // If ID matches parent, no sub selected
                            onChange={handleSubChange}
                            placeholder="Select Subcategory"
                        />
                    </div>
                )}
            </div>
        );
    };

    const FilterPill = ({ label, value, current, onClick }: { label: string, value: string, current: string, onClick: (v: string) => void }) => (
        <button
            onClick={() => onClick(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${current === value
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Transactions</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track and manage your financial history.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => openAddModal('income')}
                        className="flex items-center px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <ArrowUpCircle className="w-5 h-5 mr-2" />
                        Income
                    </button>
                    <button
                        onClick={() => openAddModal('expense')}
                        className="flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <ArrowDownCircle className="w-5 h-5 mr-2" />
                        Expense
                    </button>
                </div>
            </div>

            {/* Redesigned Filters - Only show if there are transactions or active filters */}
            {(data.length > 0 || search || filterType) && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Pill Tabs for Type */}
                    <div className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-full flex items-center space-x-1">
                        <FilterPill label="All" value="" current={filterType} onClick={setFilterType} />
                        <FilterPill label="Income" value="income" current={filterType} onClick={setFilterType} />
                        <FilterPill label="Expenses" value="expense" current={filterType} onClick={setFilterType} />
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border-none rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                        />
                    </div>
                </div>
            )}

            {/* Conditional Rendering: Table vs Simple Text */}
            {data.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fadeIn">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/30">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {data.map((tx) => {
                                    const cat = categoryMap.get(tx.category_id);
                                    let Icon = FileText;
                                    let catName = "Uncategorized";
                                    let subName = "";

                                    if (cat) {
                                        Icon = getIconComponent(cat.icon);
                                        catName = cat.title;
                                        if (cat.parent_category_id) {
                                            const parent = categoryMap.get(cat.parent_category_id);
                                            if (parent) {
                                                subName = catName;
                                                catName = parent.title;
                                            }
                                        }
                                    }

                                    return (
                                        <tr key={tx.id} className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 w-48">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-200">
                                                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                        {format(new Date(tx.date), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 pl-0.5">
                                                        <Clock className="w-3 h-3 opacity-50" />
                                                        {format(new Date(tx.date), 'h:mm a')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 w-64">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-xl mr-3 ${tx.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {catName}
                                                        </div>
                                                        {subName && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                {subName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {tx.title !== 'Untitled' ? tx.title : <span className="text-gray-400 italic">No Title</span>}
                                                </div>
                                                {tx.description && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 max-w-md">
                                                        {tx.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right`}>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${tx.type === 'income'
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                    {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingTx(tx);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(tx.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {hasMore && (
                        <div ref={ref} className="p-6 text-center text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700">
                            Loading more transactions...
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex justify-center items-center py-20">
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">No transactions</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-4">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900 dark:text-red-300">Delete this transaction?</h4>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                This action cannot be undone. The transaction will be permanently removed from your history.
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
                            onClick={confirmDelete}
                            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTx ? "Edit Transaction" : (type === 'income' ? "Add Income" : "Add Expense")}
            >
                <form onSubmit={handleSubmit} className="space-y-6">


                    {/* Row 1: Date & Amount */}
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
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 pl-8 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono font-semibold"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <CategorySelect />

                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Lunch at Joe's"
                                className="block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 px-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Note</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add extra details..."
                                className="block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 px-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-400 resize-none h-24"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ${type === 'income'
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30 hover:shadow-green-500/40'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/30 hover:shadow-red-500/40'
                                }`}
                        >
                            {editingTx ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Transactions;
