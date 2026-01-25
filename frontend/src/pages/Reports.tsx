import { useState, useEffect } from 'react';
import api from '../lib/api';
import MonthlyBarChart from '../components/reports/MonthlyBarChart';
import CategoryBarChart from '../components/reports/CategoryBarChart';
import CumulativeSavingsChart from '../components/reports/CumulativeSavingsChart';
import CategoryTrendChart from '../components/reports/CategoryTrendChart';
import ExpenseHeatmap from '../components/reports/ExpenseHeatmap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Reports = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any>(null);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [monthlyRes, categoryRes, trendRes, dailyRes] = await Promise.all([
                    api.get(`/reports/yearly-summary?year=${year}`),
                    api.get(`/reports/category-pie`, {
                        params: {
                            type: 'expense', // Fixed case
                            start_date: new Date(year, 0, 1).toISOString(),
                            end_date: new Date(year, 11, 31).toISOString()
                        }
                    }),
                    api.get(`/reports/category-trends?year=${year}`),
                    api.get(`/reports/daily-activity?year=${year}`)
                ]);
                setMonthlyData(monthlyRes.data);
                setCategoryData(categoryRes.data);
                setTrendData(trendRes.data);
                setDailyData(dailyRes.data);
            } catch (error) {
                console.error("Failed to load report data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year]);

    const totalIncome = monthlyData.reduce((acc: number, curr: any) => acc + curr.income, 0);
    const totalExpense = monthlyData.reduce((acc: number, curr: any) => acc + curr.expense, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    if (loading && monthlyData.length === 0) {
        return <div className="p-8 text-center text-slate-500">Loading reports...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Reports</h1>
                <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setYear(y => y - 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <span className="font-semibold text-slate-900 dark:text-white w-12 text-center select-none">{year}</span>
                    <button
                        onClick={() => setYear(y => y + 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</h3>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalExpense)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Savings Rate</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                        {savingsRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Monthly Activity</h2>
                    <MonthlyBarChart data={monthlyData} />
                </div>

                {/* Savings Growth */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Savings Growth</h2>
                    <CumulativeSavingsChart data={monthlyData} />
                </div>
            </div>

            {/* Spending Deep Dive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Categories */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top Categories</h2>
                    <CategoryBarChart data={categoryData.slice(0, 10)} />
                </div>

                {/* Category Trends */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Category Trends (Top 5)</h2>
                    {trendData && <CategoryTrendChart data={trendData} />}
                </div>
            </div>

            {/* Heatmap */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Spending Intensity</h2>
                <ExpenseHeatmap data={dailyData} year={year} />
            </div>
        </div>
    );
};

export default Reports;
