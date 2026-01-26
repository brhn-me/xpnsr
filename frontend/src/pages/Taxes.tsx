import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ChevronLeft, ChevronRight, Plus, Coins, Calculator, Receipt, TrendingUp, Settings, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';

interface TaxBracket {
    id: string;
    year: number;
    min_income: number;
    max_income?: number;
    rate: number;
}

interface TaxSummary {
    year: number;
    total_income: number;
    taxable_income: number;
    total_tax_liability: number;
    tax_paid_at_source: number;
    tax_paid_manually: number;
    tax_due: number;
    transactions_count: number;
}

interface TaxSettings {
    standard_deduction: number;
    tax_free_allowance: number;
}

interface Category {
    id: string;
    title: string;
    type: string;
}

interface IncomeTransaction {
    id: string;
    date: string;
    title: string;
    amount: number;
    tax_deducted_at_source: number;
    category_id: string;
}

const Taxes: React.FC = () => {
    const queryClient = useQueryClient();
    const [year, setYear] = useState(new Date().getFullYear());
    const [isBracketModalOpen, setIsBracketModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingTpsId, setEditingTpsId] = useState<string | null>(null);
    const [tpsAmount, setTpsAmount] = useState<string>('');

    // Fetch Summary
    const { data: summary } = useQuery<TaxSummary>({
        queryKey: ['taxes', 'summary', year],
        queryFn: async () => {
            const res = await api.get(`/ taxes / summary ? year = ${year} `);
            return res.data;
        }
    });

    // Fetch Brackets
    const { data: brackets = [] } = useQuery<TaxBracket[]>({
        queryKey: ['taxes', 'brackets', year],
        queryFn: async () => {
            const res = await api.get(`/ taxes / brackets ? year = ${year} `);
            return res.data;
        }
    });

    // Fetch Settings
    const { data: settings } = useQuery<TaxSettings>({
        queryKey: ['taxes', 'settings', year],
        queryFn: async () => {
            const res = await api.get(`/ taxes / settings ? year = ${year} `);
            return res.data;
        },
        enabled: isSettingsModalOpen
    });

    // Fetch Exemptions
    const { data: exemptCategoryIds = [] } = useQuery<string[]>({
        queryKey: ['taxes', 'exemptions'],
        queryFn: async () => {
            const res = await api.get('/taxes/exemptions');
            return res.data;
        },
        enabled: isSettingsModalOpen
    });

    // Fetch Income Categories (for exemptions list)
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.filter((c: any) => c.type === 'income');
        },
        enabled: isSettingsModalOpen
    });

    // Fetch Income Transactions (for TPS table)
    const { data: incomeTransactions = [] } = useQuery<IncomeTransaction[]>({
        queryKey: ['transactions', 'income', year],
        queryFn: async () => {
            // Using existing transactions endpoint with filters
            // Assuming the endpoint supports year filtering or we filter clientside.
            // Since we need all for the year, manual implementation might be heavy.
            // Using 'limit=1000' for now as MVP.
            const res = await api.get(`/ transactions ? type = income & limit=1000`);
            return res.data.filter((t: any) => new Date(t.date).getFullYear() === year);
        }
    });

    const createBracketMutation = useMutation({
        mutationFn: (data: any) => api.post('/taxes/brackets', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            setIsBracketModalOpen(false);
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => api.put(`/ taxes / settings ? year = ${year} `, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
        }
    });

    const toggleExemptionMutation = useMutation({
        mutationFn: (data: { category_id: string, is_exempt: boolean }) => api.post('/taxes/exemptions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes', 'exemptions'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'summary'] });
        }
    });

    const updateTpsMutation = useMutation({
        mutationFn: (data: { id: string, amount: number }) => api.put(`/ taxes / transactions / ${data.id}/tps?amount=${data.amount}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes', 'summary'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
            setEditingTpsId(null);
        }
    });

    const handleCreateBracket = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        createBracketMutation.mutate({
            year,
            min_income: parseFloat(formData.get('min_income') as string),
            max_income: formData.get('max_income') ? parseFloat(formData.get('max_income') as string) : null,
            rate: parseFloat(formData.get('rate') as string)
        });
    };

    const handleUpdateSettings = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        updateSettingsMutation.mutate({
            standard_deduction: parseFloat(formData.get('standard_deduction') as string),
            tax_free_allowance: parseFloat(formData.get('tax_free_allowance') as string)
        });
        setIsSettingsModalOpen(false);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Taxes</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage tax liability and filings for {year}.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setYear(year - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white w-20 text-center">
                        {year}
                    </span>
                    <button onClick={() => setYear(year + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Settings className="w-5 h-5 mr-2" />
                        Settings
                    </button>
                    <button onClick={() => setIsBracketModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Bracket
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                    <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Coins className="w-5 h-5" /></div>
                        <span className="text-sm font-medium">Taxable Income</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${summary?.taxable_income.toLocaleString() ?? '0.00'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex justify-between">
                        <span>Total Income:</span>
                        <span className="font-medium">${summary?.total_income.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-[200px] z-50">
                            Exempt income and standard deductions are subtracted from Total Income.
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg"><Calculator className="w-5 h-5" /></div>
                        <span className="text-sm font-medium">Liability</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${summary?.total_tax_liability.toLocaleString() ?? '0.00'}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg"><Receipt className="w-5 h-5" /></div>
                        <span className="text-sm font-medium">Paid</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        ${((summary?.tax_paid_at_source || 0) + (summary?.tax_paid_manually || 0)).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">TPS: ${summary?.tax_paid_at_source.toLocaleString() ?? '0'}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-sm font-medium">Tax Due</span>
                    </div>
                    <div className={`text-2xl font-bold ${(summary?.tax_due || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ${summary?.tax_due.toLocaleString() ?? '0.00'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income & TPS Table */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Income & Source Tax</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Source</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-right">TPS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {incomeTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{tx.title}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-green-600">+{tx.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            {editingTpsId === tx.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        className="w-20 px-2 py-1 text-right text-sm border rounded bg-white dark:bg-gray-600 dark:text-white"
                                                        value={tpsAmount}
                                                        onChange={e => setTpsAmount(e.target.value)}
                                                        onBlur={() => {
                                                            if (tpsAmount) updateTpsMutation.mutate({ id: tx.id, amount: parseFloat(tpsAmount) });
                                                            else setEditingTpsId(null);
                                                        }}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                updateTpsMutation.mutate({ id: tx.id, amount: parseFloat(tpsAmount) });
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingTpsId(tx.id);
                                                        setTpsAmount(tx.tax_deducted_at_source?.toString() || '');
                                                    }}
                                                    className="flex items-center justify-end gap-1 ml-auto hover:text-blue-600 text-gray-500"
                                                >
                                                    {tx.tax_deducted_at_source > 0 ? (
                                                        <span className="text-red-500 font-medium">-${tx.tax_deducted_at_source.toLocaleString()}</span>
                                                    ) : (
                                                        <span className="text-gray-300">Add</span>
                                                    )}
                                                    <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Brackets Table */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tax Brackets</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Min Income</th>
                                    <th className="px-6 py-4 font-semibold">Max Income</th>
                                    <th className="px-6 py-4 font-semibold">Rate (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {brackets.map(bracket => (
                                    <tr key={bracket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${bracket.min_income.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {bracket.max_income ? `$${bracket.max_income.toLocaleString()}` : '∞'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{bracket.rate}%</td>
                                    </tr>
                                ))}
                                {brackets.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No tax brackets defined for {year}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isBracketModalOpen} onClose={() => setIsBracketModalOpen(false)} title="Add Tax Bracket">
                <form onSubmit={handleCreateBracket} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Income</label>
                            <input type="number" name="min_income" required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Income</label>
                            <input type="number" name="max_income" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="Leave empty for ∞" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                        <input type="number" step="0.1" name="rate" required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" placeholder="10.0" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsBracketModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">Add Bracket</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Tax Settings">
                <div className="space-y-6">
                    <form id="settings-form" onSubmit={handleUpdateSettings} className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Constants</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Deduction</label>
                                <input type="number" name="standard_deduction" defaultValue={settings?.standard_deduction || 0} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Free Allowance</label>
                                <input type="number" name="tax_free_allowance" defaultValue={settings?.tax_free_allowance || 0} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white" />
                            </div>
                        </div>
                    </form>

                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Exempt Categories</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {categories.map(cat => {
                                const isExempt = exemptCategoryIds.includes(cat.id);
                                return (
                                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.title}</span>
                                        <button
                                            onClick={() => toggleExemptionMutation.mutate({ category_id: cat.id, is_exempt: !isExempt })}
                                            className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 ease-in-out ${isExempt ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        >
                                            <span className={`w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ml-1 ${isExempt ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={() => setIsSettingsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" form="settings-form" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">Save Settings</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Taxes;

