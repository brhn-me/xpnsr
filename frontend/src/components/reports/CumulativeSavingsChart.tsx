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

interface MonthlyData {
    date: string;
    income: number;
    expense: number;
}

interface CumulativeSavingsChartProps {
    data: MonthlyData[];
}

const CumulativeSavingsChart: React.FC<CumulativeSavingsChartProps> = ({ data }) => {
    // Process data to get cumulative savings
    let runningTotal = 0;
    const processedData = data.map(item => {
        const savings = item.income - item.expense;
        runningTotal += savings;
        return {
            ...item,
            savings,
            cumulative: runningTotal
        };
    });

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
                <LineChart
                    data={processedData}
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
                        tickFormatter={(value) => `$${value / 1000}k`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(value: any) => [formatCurrency(value), 'Cumulative Savings']}
                        labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Net Savings (YTD)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CumulativeSavingsChart;
