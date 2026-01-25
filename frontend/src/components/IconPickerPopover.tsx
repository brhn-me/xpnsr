import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ICONS_LIST, getIconComponent } from '../lib/icons';

interface IconPickerPopoverProps {
    currentIcon: string;
    onSelect: (iconName: string) => void;
    onClose: () => void;
    isOpen: boolean;
    triggerRef: React.RefObject<HTMLElement>;
}

const IconPickerPopover: React.FC<IconPickerPopoverProps> = ({ currentIcon, onSelect, onClose, isOpen, triggerRef }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSearchTerm(''); // Reset search on open
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const updatePosition = () => {
                if (triggerRef.current) {
                    const rect = triggerRef.current.getBoundingClientRect();

                    const spaceBelow = window.innerHeight - rect.bottom;
                    const spaceAbove = rect.top;
                    const spaceRight = window.innerWidth - rect.left;

                    const showAbove = spaceBelow < 400 && spaceAbove > spaceBelow;
                    const showLeft = spaceRight < 350;

                    const newStyle: React.CSSProperties = {};

                    // Vertical Positioning
                    if (showAbove) {
                        newStyle.bottom = window.innerHeight - rect.top + 8;
                        newStyle.transformOrigin = 'bottom';
                    } else {
                        newStyle.top = rect.bottom + 8;
                        newStyle.transformOrigin = 'top';
                    }

                    // Horizontal Positioning
                    if (showLeft) {
                        newStyle.right = window.innerWidth - rect.right;
                        newStyle.transformOrigin += ' right';
                    } else {
                        newStyle.left = rect.left;
                        newStyle.transformOrigin += ' left';
                    }

                    setPopoverStyle(newStyle);
                }
            };

            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, triggerRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    const filteredIcons = ICONS_LIST.filter(iconName =>
        iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-[360px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            style={popoverStyle}
        >
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Search icons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    autoFocus
                />
            </div>

            <div className="p-2 overflow-y-auto max-h-[320px]">
                {filteredIcons.length > 0 ? (
                    <div className="grid grid-cols-8 gap-1">
                        {filteredIcons.map((iconName) => {
                            const Icon = getIconComponent(iconName);
                            const isSelected = currentIcon === iconName;
                            return (
                                <button
                                    key={iconName}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(iconName);
                                    }}
                                    title={iconName}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg transition-all
                                        ${isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'}
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-gray-400">
                        No icons found
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default IconPickerPopover;
