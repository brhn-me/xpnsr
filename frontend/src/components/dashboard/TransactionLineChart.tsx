import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface DataPoint {
    date: string;
    income: number;
    expense: number;
}

interface Props {
    data: DataPoint[];
    isLoading: boolean;
}

const TransactionLineChart: React.FC<Props> = ({ data, isLoading }) => {
    if (isLoading) {
        return <div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />;
    }

    if (data.length === 0) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-2xl">
                No data available for this period
            </div>
        );
    }

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickFormatter={(str) => {
                            try {
                                return format(parseISO(str), 'MMM d');
                            } catch (e) {
                                return str;
                            }
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any) => [`$${value}`, '']}
                        labelFormatter={(label) => format(parseISO(label), 'MMMM d, yyyy')}
                    />
                    <Legend iconType="circle" />
                    <Area
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        name="Expense"
                        stroke="#EF4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TransactionLineChart;
