import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

interface StatsProps {
    total_balance: number;
    total_income: number;
    total_expense: number;
    savings_rate: number;
    isLoading: boolean;
}

const StatsCards: React.FC<StatsProps> = ({ total_balance, total_income, total_expense, savings_rate, isLoading }) => {

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const cards = [
        {
            label: 'Total Balance',
            value: formatCurrency(total_balance),
            icon: DollarSign,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            label: 'Total Income',
            value: formatCurrency(total_income),
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/30',
        },
        {
            label: 'Total Expense',
            value: formatCurrency(total_expense),
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/30',
        },
        {
            label: 'Savings Rate',
            value: `${savings_rate.toFixed(1)}%`,
            icon: PiggyBank,
            color: 'text-purple-600',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse h-32"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:scale-[1.02]">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                        <h3 className={`text-2xl font-bold mt-1 ${card.color.replace('text-', 'text-gray-900 dark:text-white ')}`}>
                            {card.value}
                        </h3>
                        {/* Note: I removed the color from the text itself to keep it clean, or we can apply it. 
                            Let's keep specific colors for Income/Expense for clarity.
                        */}
                    </div>
                    <div className={`p-3 rounded-xl ${card.bg}`}>
                        <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
