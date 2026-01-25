import React, { useEffect, useState, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { format } from 'date-fns';

import { Search, Edit2, Trash2, Calendar, FileText, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Modal from '../components/Modal';
import TransactionForm from '../components/transactions/TransactionForm';
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

    const [type, setType] = useState<'income' | 'expense'>('expense');

    useEffect(() => {
        if (!isModalOpen) {
            setEditingTx(null);
        }
    }, [isModalOpen]);



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
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-px">Actions</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-px">
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

            {/* Main Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTx ? "Edit Transaction" : (type === 'income' ? "Add Income" : "Add Expense")}
                size="4xl"
            >
                <TransactionForm
                    type={type}
                    initialData={editingTx}
                    onCancel={() => setIsModalOpen(false)}
                    onSubmit={(data) => {
                        if (editingTx) {
                            updateMutation.mutate({ ...data, id: editingTx.id });
                        } else {
                            createMutation.mutate(data);
                        }
                    }}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                    submitLabel={editingTx ? "Update" : "Save"}
                />
            </Modal>
        </div>
    );
};

export default Transactions;
