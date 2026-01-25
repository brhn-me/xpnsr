import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, ChevronUp, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface UserMenuProps {
    collapsed: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ collapsed }) => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Dark Mode Sync
    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
        } else {
            setDarkMode(false);
        }
    }, []);

    const toggleTheme = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent closing menu if helpful, but usually we might want to keep it open or close it. Keeping it open for toggle is nice.
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center w-full p-2 rounded-xl transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-800",
                    collapsed ? "justify-center" : "gap-3"
                )}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white dark:ring-gray-700">
                    <span className="text-sm font-bold">{user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}</span>
                </div>

                {!collapsed && (
                    <>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{user.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <ChevronUp className={clsx("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={clsx(
                    "absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-200 origin-bottom-left z-50",
                    collapsed ? "left-12 w-64 mb-[-40px]" : "w-[calc(100%-8px)] left-1"
                )}>
                    {collapsed && (
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    )}

                    <div className="p-2 space-y-1">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            {darkMode ? <Sun className="w-4 h-4 mr-3 text-orange-500" /> : <Moon className="w-4 h-4 mr-3 text-blue-500" />}
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>

                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

                        <button
                            onClick={logout}
                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
