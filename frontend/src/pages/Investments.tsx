
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Trash2, Edit2, PieChart, TrendingUp, Calendar, RefreshCcw } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import Modal from '../components/Modal';

interface Investment {
    id: string;
    title: string;
    type: 'FD' | 'BONDS' | 'DPS' | 'STOCK' | 'TRADING';
    principal_amount: number;
    current_value: number;
    interest_rate: number;
    interest_amount: number;
    start_date: string;
    maturity_date?: string;
    tenure_months: number;
    auto_renew: boolean;
    tax_rate: number;
    tax_amount: number;
    status: 'ACTIVE' | 'MATURED' | 'CLOSED';
}

const Investments: React.FC = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInv, setEditingInv] = useState<Investment | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data: investments = [] } = useQuery<Investment[]>({
        queryKey: ['investments'],
        queryFn: async () => {
            const res = await api.get('/investments');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/investments', data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investments'] }); setIsFormOpen(false); }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/investments/${data.id}`, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investments'] }); setIsFormOpen(false); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/investments/${id}`),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investments'] }); setDeleteId(null); }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            title: formData.get('title'),
            type: formData.get('type'),
            principal_amount: parseFloat(formData.get('principal_amount') as string),
            current_value: parseFloat(formData.get('current_value') as string),
            interest_rate: parseFloat(formData.get('interest_rate') as string),
            interest_amount: parseFloat(formData.get('interest_amount') as string || '0'),
            start_date: formData.get('start_date'),
            maturity_date: formData.get('maturity_date') || null,
            tenure_months: parseInt(formData.get('tenure_months') as string || '0'),
            auto_renew: formData.get('auto_renew') === 'on',
            tax_rate: parseFloat(formData.get('tax_rate') as string || '0'),
            tax_amount: parseFloat(formData.get('tax_amount') as string || '0'),
        };

        if (editingInv) {
            updateMutation.mutate({ ...data, id: editingInv.id });
        } else {
            createMutation.mutate(data);
        }
    };

    const openCreate = () => { setEditingInv(null); setIsFormOpen(true); };
    const openEdit = (inv: Investment) => { setEditingInv(inv); setIsFormOpen(true); };

    // Stats
    const totalInvested = investments.reduce((sum, i) => sum + i.principal_amount, 0);
    const totalCurrent = investments.reduce((sum, i) => sum + i.current_value, 0);
    const totalGain = totalCurrent - totalInvested;

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Investments</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your portfolio and track returns.</p>
                </div>
                <button onClick={openCreate} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    <Plus className="w-5 h-5 mr-2" />
                    New Investment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">Total Invested</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalInvested.toLocaleString()}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">Current Value</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">${totalCurrent.toLocaleString()}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">Total Returns</div>
                    <div className={`text-2xl font-bold mt-1 ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalGain >= 0 ? '+' : ''}{totalGain.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Principal</th>
                                <th className="px-6 py-4 text-right">Value</th>
                                <th className="px-6 py-4 text-right">Interest</th>
                                <th className="px-6 py-4">Maturity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {investments.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inv.title}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-600 dark:text-gray-300">{inv.type}</span></td>
                                    <td className="px-6 py-4 text-right text-gray-500">${inv.principal_amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">${inv.current_value.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-green-600">
                                        <div>{inv.interest_rate}%</div>
                                        {inv.interest_amount > 0 && <div className="text-xs text-gray-400">+${inv.interest_amount}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div>{inv.maturity_date ? format(new Date(inv.maturity_date), 'MMM d, yyyy') : '-'}</div>
                                        {(inv.tax_amount > 0 || inv.tax_rate > 0) && <div className="text-xs text-red-400">Tax: ${inv.tax_amount} ({inv.tax_rate}%)</div>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEdit(inv)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteId(inv.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {investments.length === 0 && <div className="p-8 text-center text-gray-400">No investments found.</div>}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingInv ? "Edit Investment" : "New Investment"} size="3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input type="text" name="title" defaultValue={editingInv?.title} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="e.g. 5-Year FD" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select name="type" defaultValue={editingInv?.type || 'FD'} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white">
                                <option value="FD">Fixed Deposit (FD)</option>
                                <option value="BONDS">Bonds</option>
                                <option value="DPS">DPS/Pension</option>
                                <option value="STOCK">Stocks</option>
                                <option value="TRADING">Trading</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
                            <input type="number" step="0.01" name="interest_rate" defaultValue={editingInv?.interest_rate} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="5.0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Amount</label>
                            <input type="number" step="0.01" name="principal_amount" defaultValue={editingInv?.principal_amount} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Value</label>
                            <input type="number" step="0.01" name="current_value" defaultValue={editingInv?.current_value} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input type="date" name="start_date" defaultValue={editingInv?.start_date} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maturity Date</label>
                            <input type="date" name="maturity_date" defaultValue={editingInv?.maturity_date} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                            <input type="checkbox" name="auto_renew" defaultChecked={editingInv?.auto_renew} id="auto_renew" className="w-4 h-4 text-blue-600 rounded" />
                            <label htmlFor="auto_renew" className="text-sm text-gray-700 dark:text-gray-300">Auto Renew on Maturity</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">{editingInv ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Investment" size="md">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">Are you sure? This cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={() => deleteMutation.mutate(deleteId!)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Investments;
