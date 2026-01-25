import React from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';
import { clsx } from 'clsx';

interface DailyActivity {
    date: string;
    amount: number;
    count: number;
}

interface ExpenseHeatmapProps {
    data: DailyActivity[];
    year: number;
}

const ExpenseHeatmap: React.FC<ExpenseHeatmapProps> = ({ data, year }) => {
    // Create map for easy lookup
    const dataMap = new Map();
    let maxAmount = 0;

    data.forEach(d => {
        dataMap.set(d.date, d);
        if (d.amount > maxAmount) maxAmount = d.amount;
    });

    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Determine color intensity
    const getColor = (amount: number) => {
        if (amount === 0) return 'bg-slate-100 dark:bg-slate-800';
        // Simple linear scaling for 4 levels
        const ratio = amount / (maxAmount || 1);
        if (ratio < 0.25) return 'bg-emerald-200';
        if (ratio < 0.5) return 'bg-emerald-300';
        if (ratio < 0.75) return 'bg-emerald-400';
        return 'bg-emerald-500';
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex flex-col gap-1 min-w-[700px]">
                {/* Months labels could go here, but focusing on grid for now */}

                <div className="grid grid-flow-col gap-1 grid-rows-7 h-[140px]">
                    {/* Days of week labels (First Column) */}
                    {/* Actually, standard is cols are weeks, rows are days (Sun-Sat) */}

                    {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const activity = dataMap.get(dateStr);
                        const amount = activity?.amount || 0;
                        const count = activity?.count || 0;

                        return (
                            <div
                                key={dateStr}
                                className={clsx(
                                    "w-3 h-3 rounded-sm cursor-help relative group",
                                    getColor(amount)
                                )}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                                    <div className="font-semibold">{format(day, 'MMM d, yyyy')}</div>
                                    <div>{count} transactions</div>
                                    <div className="font-mono">${amount.toLocaleString()}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-end gap-2 text-xs text-slate-500 mt-2">
                    <span>Less</span>
                    <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm"></div>
                    <div className="w-3 h-3 bg-emerald-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default ExpenseHeatmap;
