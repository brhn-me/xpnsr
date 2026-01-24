import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', expense: 4000, income: 2400 },
    { name: 'Feb', expense: 3000, income: 1398 },
    { name: 'Mar', expense: 2000, income: 9800 },
    { name: 'Apr', expense: 2780, income: 3908 },
    { name: 'May', expense: 1890, income: 4800 },
    { name: 'Jun', expense: 2390, income: 3800 },
];

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Balance</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">$12,345.00</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Income</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">+$4,500.00</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Expense</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">-$2,155.00</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-[400px]">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Overview</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="income" fill="#10B981" />
                        <Bar dataKey="expense" fill="#EF4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
