
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Wallet, CreditCard, Banknote, Trash2, Edit2, TrendingUp, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';

interface Account {
    id: string;
    name: string;
    type: 'BANK' | 'MOBILE_WALLET' | 'CASH' | 'INVESTMENT';
    currency: string;
    balance: number;
    interest_rate: number;
    account_number?: string;
    bank_name?: string;
    branch_name?: string;
    is_active: boolean;
}

const Accounts: React.FC = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch Accounts
    const { data: accounts = [] } = useQuery<Account[]>({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await api.get('/accounts');
            return res.data;
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/accounts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            setIsFormOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/accounts/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            setIsFormOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/accounts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            setIsDeleteModalOpen(false);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            type: formData.get('type'),
            currency: formData.get('currency'),
            balance: parseFloat(formData.get('balance') as string),
            interest_rate: parseFloat(formData.get('interest_rate') as string || '0'),
            account_number: formData.get('account_number'),
            bank_name: formData.get('bank_name'),
            branch_name: formData.get('branch_name'),
        };

        if (editingAccount) {
            updateMutation.mutate({ ...data, id: editingAccount.id });
        } else {
            createMutation.mutate(data);
        }
    };

    const openCreate = () => {
        setEditingAccount(null);
        setIsFormOpen(true);
    };

    const openEdit = (acc: Account) => {
        setEditingAccount(acc);
        setIsFormOpen(true);
    };

    const openDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    // Calculations
    const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const getIcon = (type: string) => {
        switch (type) {
            case 'BANK': return <Wallet className="w-6 h-6" />;
            case 'MOBILE_WALLET': return <CreditCard className="w-6 h-6" />;
            case 'CASH': return <Banknote className="w-6 h-6" />;
            default: return <DollarSign className="w-6 h-6" />;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Accounts</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your net worth and balances.</p>
                </div>
                <button onClick={openCreate} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Account
                </button>
            </div>

            {/* Net Worth Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-emerald-100 font-medium mb-1 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Net Worth
                    </div>
                    <div className="text-4xl font-bold">${totalNetWorth.toLocaleString()}</div>
                </div>
                <div className="absolute right-0 top-0 p-8 opacity-10">
                    <TrendingUp className="w-40 h-40" />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(account => (
                    <div key={account.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${account.type === 'BANK' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                {getIcon(account.type)}
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">${account.balance.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">{account.currency}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{account.name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{account.type.replace('_', ' ')}</p>
                            {account.account_number && <p className="text-xs text-gray-400 mt-1">Acct: {account.account_number}</p>}
                            {account.bank_name && <p className="text-xs text-gray-400">{account.bank_name} - {account.branch_name}</p>}
                        </div>

                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <button onClick={() => openEdit(account)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => openDelete(account.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingAccount ? "Edit Account" : "Add Account"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                        <input type="text" name="name" defaultValue={editingAccount?.name} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="e.g. Chase Checking" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select name="type" defaultValue={editingAccount?.type || 'BANK'} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:text-white">
                                <option value="BANK">Bank</option>
                                <option value="MOBILE_WALLET">Mobile Wallet</option>
                                <option value="CASH">Cash</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                            <input type="text" name="currency" defaultValue={editingAccount?.currency || 'USD'} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:text-white" />
                        </div>
                    </div>

                    {/* Bank Details (Optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bank Details (Optional)</div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                            <input type="text" name="bank_name" defaultValue={editingAccount?.bank_name} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="Chase" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                            <input type="text" name="branch_name" defaultValue={editingAccount?.branch_name} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="Main St" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account No.</label>
                            <input type="text" name="account_number" defaultValue={editingAccount?.account_number} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="****1234" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Balance</label>
                        <div className="relative">
                            <span className="absolute left-4 top-2.5 text-gray-400">$</span>
                            <input type="number" step="0.01" name="balance" defaultValue={editingAccount?.balance} required className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">{editingAccount ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Account" size="md">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">Are you sure? This will delete the account and its history.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={() => deleteMutation.mutate(deleteId!)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Accounts;
