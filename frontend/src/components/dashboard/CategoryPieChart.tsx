import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DataPoint {
    name: string;
    value: number;
}

interface Props {
    data: DataPoint[];
    isLoading: boolean;
    colors?: string[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const CategoryPieChart: React.FC<Props> = ({ data, isLoading, colors = COLORS }) => {
    if (isLoading) {
        return <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />;
    }

    if (data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-2xl text-sm">
                No category data
            </div>
        );
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoryPieChart;
