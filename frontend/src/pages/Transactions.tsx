import React, { useEffect, useState, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { format } from 'date-fns';
import { Search, Filter, Edit2, Trash2, Calendar, FileText, Clock, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Modal from '../components/Modal';
import Calculator from '../components/Calculator';
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
    // Amount is now a string to allow calculator expressions
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState(''); // Stores the FINAL selected category (could be parent or sub)
    const [selectedParentId, setSelectedParentId] = useState<string>(''); // Used for UI navigation

    // Date & Time Split
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [showDetails, setShowDetails] = useState(false);

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

            // Extract date and time
            const dt = new Date(editingTx.date);
            setDate(dt.toISOString().split('T')[0]);
            setTime(dt.toTimeString().split(' ')[0].slice(0, 5));

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

            // Show details if they exist
            if (editingTx.title || editingTx.description) {
                setShowDetails(true);
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
        setCategoryId('');
        setSelectedParentId('');
        setShowDetails(false);
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setTime(now.toTimeString().split(' ')[0].slice(0, 5));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Evaluate amount if it's an expression
        let finalAmount = 0;
        try {
            // Check if it needs evaluation (contains math operators)
            if (/[+\-*/]/.test(amount)) {
                // simple sanitize
                const sanitized = amount.replace(/[^0-9+\-*/().]/g, '');
                // eslint-disable-next-line no-new-func
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

        // combine date and time
        const combined = new Date(`${date}T${time}:00`).toISOString();

        const payload = {
            amount: parseFloat(finalAmount.toFixed(2)),
            title: title,
            description,
            type,
            category_id: categoryId,
            date: combined
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

    // --- NEW GRID COMPONENTS ---

    // Parent Grid
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

    // Subcategory Grid
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

            {/* Redesigned Filters */}
            {(data.length > 0 || search || filterType) && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-full flex items-center space-x-1">
                        <FilterPill label="All" value="" current={filterType} onClick={setFilterType} />
                        <FilterPill label="Income" value="income" current={filterType} onClick={setFilterType} />
                        <FilterPill label="Expenses" value="expense" current={filterType} onClick={setFilterType} />
                    </div>

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

            {/* Table */}
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
                                                    {tx.title ? tx.title : <span className="text-gray-400 italic">No Title</span>}
                                                </div>
                                                {tx.description && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 max-w-md">
                                                        {tx.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right`}>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${tx.type === 'income'
                                                    ? 'text-green-700 dark:text-green-400'
                                                    : 'text-red-700 dark:text-red-400'
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
                size="md"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-4">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900 dark:text-red-300">Delete this transaction?</h4>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                This action cannot be undone.
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

            {/* Main Transaction Modal - 2 Columns */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTx ? "Edit Transaction" : (type === 'income' ? "Add Income" : "Add Expense")}
                size="4xl" // Wider modal
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

                        {/* LEFT COLUMN: Inputs (Span 3) */}
                        <div className="md:col-span-3 space-y-6">

                            {/* Date & Time */}
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

                            {/* Categories */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                <CategoryGrid />
                                <SubcategoryGrid />
                            </div>

                            {/* Additional Details Toggle */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
                                >
                                    {showDetails ? '- Hide details' : '+ More Details'}
                                </button>
                            </div>

                            {/* Title & Note (Collapsible) */}
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

                        {/* RIGHT COLUMN: Calculator (Span 2) */}
                        <div className="md:col-span-2 flex flex-col gap-4">

                            {/* Amount Display */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-gray-500 text-lg font-bold z-10">$</span>
                                    {/* Calculated input type text to allow expressions */}
                                    <input
                                        type="text"
                                        required
                                        value={amount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Allow only numbers and math operators
                                            if (/^[0-9+\-*/().\s]*$/.test(val)) {
                                                setAmount(val);
                                            }
                                        }}
                                        className="block w-full rounded-2xl border-gray-200 bg-gray-50 pl-9 pr-4 focus:border-blue-500 focus:ring-blue-500 text-2xl py-3 dark:bg-gray-800 dark:border-gray-600 dark:text-white font-bold tracking-tight text-right shadow-inner"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Calculator Keypad */}
                            <div className="flex-1">
                                <Calculator value={amount} onChange={setAmount} />
                            </div>

                            {/* Actions (placed here or below? Below seems better for flow, or stick to bottom of form) */}
                            {/* Moving actions to span full width below grid? Or keep inside right col? 
                                User asked for 2 columns. Let's put actions at the very bottom of the right column?
                                Or maybe better: keep generic actions at bottom of form, taking full width.
                            */}
                        </div>
                    </div>

                    {/* Bottom Actions - Spanning full width */}
                    <div className="flex justify-end pt-8 gap-3 border-t border-gray-100 dark:border-gray-700 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${type === 'income'
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30 hover:shadow-green-500/40'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/30 hover:shadow-red-500/40'
                                }`}
                        >
                            {editingTx
                                ? (updateMutation.isPending ? 'Updating...' : 'Update')
                                : (createMutation.isPending ? 'Saving...' : 'Save')
                            }
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Transactions;
