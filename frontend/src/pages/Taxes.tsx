
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ChevronLeft, ChevronRight, Plus, Coins, Calculator, Receipt, TrendingUp } from 'lucide-react';
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

const Taxes: React.FC = () => {
    const queryClient = useQueryClient();
    const [year, setYear] = useState(new Date().getFullYear());
    const [isBracketModalOpen, setIsBracketModalOpen] = useState(false);

    // Fetch Summary
    const { data: summary } = useQuery<TaxSummary>({
        queryKey: ['taxes', 'summary', year],
        queryFn: async () => {
            const res = await api.get(`/taxes/summary?year=${year}`);
            return res.data;
        }
    });

    // Fetch Brackets
    const { data: brackets = [] } = useQuery<TaxBracket[]>({
        queryKey: ['taxes', 'brackets', year],
        queryFn: async () => {
            const res = await api.get(`/taxes/brackets?year=${year}`);
            return res.data;
        }
    });

    const createBracketMutation = useMutation({
        mutationFn: (data: any) => api.post('/taxes/brackets', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            setIsBracketModalOpen(false);
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

                <button onClick={() => setIsBracketModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Bracket
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Coins className="w-5 h-5" /></div>
                        <span className="text-sm font-medium">Taxable Income</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${summary?.taxable_income.toLocaleString() ?? '0.00'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Total: ${summary?.total_income.toLocaleString() ?? '0'}</div>
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

            {/* Brackets */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">Tax Brackets ({year})</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
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
        </div>
    );
};

export default Taxes;
