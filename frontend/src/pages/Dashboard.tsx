import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import StatsCards from '../components/dashboard/StatsCards';
import TransactionLineChart from '../components/dashboard/TransactionLineChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import DateFilter from '../components/dashboard/DateFilter';
import type { DateRange } from '../components/dashboard/DateFilter';
import { subDays, startOfYear, format } from 'date-fns';
import { ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [dateRange, setDateRange] = useState<DateRange>('30d');

    // Calculate dates based on range
    const { startDate, endDate } = useMemo(() => {
        const end = new Date();
        let start = subDays(end, 30);

        switch (dateRange) {
            case '7d': start = subDays(end, 7); break;
            case '30d': start = subDays(end, 30); break;
            case '90d': start = subDays(end, 90); break;
            case 'this_year': start = startOfYear(end); break;
            case 'all': start = new Date(0); break;
        }

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
    }, [dateRange]);

    // Fetch Summary Stats
    const summaryQuery = useQuery({
        queryKey: ['reports', 'summary', startDate],
        queryFn: async () => {
            const res = await api.get('/reports/summary', { params: { start_date: startDate, end_date: endDate } });
            return res.data;
        }
    });

    // Fetch Time Series
    const seriesQuery = useQuery({
        queryKey: ['reports', 'series', startDate],
        queryFn: async () => {
            const res = await api.get('/reports/time-series', { params: { start_date: startDate, end_date: endDate, period: 'daily' } });
            return res.data;
        }
    });

    // Fetch Expense Pie
    const expensePieQuery = useQuery({
        queryKey: ['reports', 'pie', 'expense', startDate],
        queryFn: async () => {
            const res = await api.get('/reports/category-pie', { params: { type: 'expense', start_date: startDate, end_date: endDate } });
            return res.data;
        }
    });

    // Fetch Income Pie
    const incomePieQuery = useQuery({
        queryKey: ['reports', 'pie', 'income', startDate],
        queryFn: async () => {
            const res = await api.get('/reports/category-pie', { params: { type: 'income', start_date: startDate, end_date: endDate } });
            return res.data;
        }
    });

    // Fetch Recent Transactions (Limit 5)
    // We reuse the transactions API, just limit 5
    const recentTxQuery = useQuery({
        queryKey: ['transactions', 'recent'],
        queryFn: async () => {
            const res = await api.get('/transactions', { params: { limit: 5, skip: 0 } });
            return res.data;
        }
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Financial overview for the selected period.</p>
                </div>
                <DateFilter value={dateRange} onChange={setDateRange} />
            </div>

            {/* Stats Cards */}
            <StatsCards
                total_balance={summaryQuery.data?.total_balance || 0}
                total_income={summaryQuery.data?.total_income || 0}
                total_expense={summaryQuery.data?.total_expense || 0}
                savings_rate={summaryQuery.data?.savings_rate || 0}
                isLoading={summaryQuery.isLoading}
            />

            {/* Main Chart Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Income vs Expense
                    </h3>
                </div>
                <TransactionLineChart
                    data={seriesQuery.data || []}
                    isLoading={seriesQuery.isLoading}
                />
            </div>

            {/* Pie Charts & Recent Activity */}
            {/* Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Expense Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Expense Breakdown</h3>
                    <CategoryPieChart
                        data={expensePieQuery.data || []}
                        isLoading={expensePieQuery.isLoading}
                    // Default colors are fine
                    />
                </div>

                {/* Income Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Income Sources</h3>
                    <CategoryPieChart
                        data={incomePieQuery.data || []}
                        isLoading={incomePieQuery.isLoading}
                    />
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                    <Link to="/transactions" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                        View all <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    {recentTxQuery.isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (recentTxQuery.data || []).length > 0 ? (
                        <div className="space-y-3">
                            {(recentTxQuery.data || []).map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors group border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-green-100/50 text-green-600' : 'bg-red-100/50 text-red-600'
                                            }`}>
                                            <span className="text-xs font-bold">{tx.type === 'income' ? 'IN' : 'OUT'}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{tx.title || 'Untitled'}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(tx.date), 'MMM d, yyyy • h:mm a')}</p>
                                        </div>
                                    </div>
                                    <span className={`text-base font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm">
                            <p>No recent transactions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
