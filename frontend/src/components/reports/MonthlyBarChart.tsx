import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

interface MonthlyData {
    date: string; // ISO date string
    income: number;
    expense: number;
}

interface MonthlyBarChartProps {
    data: MonthlyData[];
}

const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ data }) => {

    const formatXAxis = (tickItem: string) => {
        try {
            return format(new Date(tickItem), 'MMM');
        } catch {
            return tickItem;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={(value) => `$${value / 1000}k`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(value: any) => [formatCurrency(value), '']}
                        labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyBarChart;
