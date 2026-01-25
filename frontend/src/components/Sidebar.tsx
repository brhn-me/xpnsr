import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    Tags,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import UserMenu from './UserMenu';

interface SidebarProps {
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Transactions', path: '/transactions', icon: Receipt },
        { name: 'Categories', path: '/categories', icon: Tags },
    ];

    return (
        <div
            className={clsx(
                "bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out relative z-20",
                collapsed ? "w-20" : "w-72",
                className
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors z-50"
            >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            {/* Header / Logo */}
            <div className={clsx("h-20 flex items-center px-6 transition-all duration-300", collapsed ? " justify-center px-0" : "")}>
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <span
                        className={clsx(
                            "text-xl font-bold text-slate-900 dark:text-white tracking-tight transition-all duration-300 origin-left",
                            collapsed ? "opacity-0 w-0 scale-0" : "opacity-100 scale-100"
                        )}
                    >
                        Xpnsr
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative',
                                isActive
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                            )}
                            title={collapsed ? item.name : undefined}
                        >
                            <Icon className={clsx(
                                "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                            )} />
                            <span className={clsx("ml-3 whitespace-nowrap font-medium transition-all duration-300", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Menu */}
            <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <UserMenu collapsed={collapsed} />
            </div>
        </div>
    );
};

export default Sidebar;
