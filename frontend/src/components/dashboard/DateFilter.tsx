import React from 'react';

export type DateRange = '7d' | '30d' | '90d' | 'this_year' | 'all';

interface Props {
    value: DateRange;
    onChange: (val: DateRange) => void;
}

const DateFilter: React.FC<Props> = ({ value, onChange }) => {
    const options: { label: string; val: DateRange }[] = [
        { label: '7 Days', val: '7d' },
        { label: '30 Days', val: '30d' },
        { label: '3 Months', val: '90d' },
        { label: 'This Year', val: 'this_year' },
    ];

    return (
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {options.map((opt) => (
                <button
                    key={opt.val}
                    onClick={() => onChange(opt.val)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${value === opt.val
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

export default DateFilter;
