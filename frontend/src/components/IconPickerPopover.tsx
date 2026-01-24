import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ICON_MAP, ICONS_LIST, getIconComponent } from '../lib/icons';

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

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const updatePosition = () => {
                if (triggerRef.current) {
                    const rect = triggerRef.current.getBoundingClientRect();
                    const POPOVER_WIDTH = 280; // w-64 is 256px + padding/borders
                    const POPOVER_HEIGHT = 320; // Approx height

                    const spaceBelow = window.innerHeight - rect.bottom;
                    const spaceAbove = rect.top;
                    const spaceRight = window.innerWidth - rect.left;

                    // Decision Logic
                    const showAbove = spaceBelow < POPOVER_HEIGHT && spaceAbove > spaceBelow;
                    const showLeft = spaceRight < POPOVER_WIDTH;

                    const newStyle: React.CSSProperties = {};

                    // Vertical Positioning
                    if (showAbove) {
                        newStyle.bottom = window.innerHeight - rect.top + 8; // 8px spacing
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

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed z-[9999] p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-64 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-0 duration-200"
            style={popoverStyle}
        >
            {ICONS_LIST.map((iconName) => {
                const Icon = getIconComponent(iconName);
                const isSelected = currentIcon === iconName;
                return (
                    <button
                        key={iconName}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(iconName);
                        }}
                        className={`
                            p-2 flex items-center justify-center rounded-xl transition-all
                            ${isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'}
                        `}
                    >
                        <Icon className="w-5 h-5" />
                    </button>
                );
            })}
        </div>,
        document.body
    );
};

export default IconPickerPopover;
