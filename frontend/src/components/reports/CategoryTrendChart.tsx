import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { format } from 'date-fns';

interface CategoryTrendData {
    categories: string[];
    data: any[]; // { date: string, Category1: number, Category2: number ... }
}

interface CategoryTrendChartProps {
    data: CategoryTrendData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const CategoryTrendChart: React.FC<CategoryTrendChartProps> = ({ data }) => {

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (!data || !data.data || data.data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-slate-400">No trend data available</div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data.data}
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
                        tickFormatter={(label) => format(new Date(label), 'MMM')}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={(value) => `$${value}`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(value: any) => [formatCurrency(value), '']}
                        labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
                    />
                    <Legend />
                    {data.categories.map((cat, index) => (
                        <Line
                            key={cat}
                            type="monotone"
                            dataKey={cat}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            name={cat}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoryTrendChart;
