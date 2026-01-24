import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, ArrowDownCircle, ArrowUpCircle, GripVertical, Check,
    ChevronDown, ChevronRight, Trash2, AlertTriangle
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getIconComponent } from '../lib/icons';
import IconPickerPopover from '../components/IconPickerPopover';
import Modal from '../components/Modal';

interface Category {
    id: string;
    title: string;
    type: 'income' | 'expense';
    icon?: string;
    slug: string;
    sort_order: number;
    parent_category_id?: string | null;
    subcategories?: Category[];
    isNew?: boolean;
}

// --- Delete Confirmation Modal ---
interface DeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    categoryTitle: string;
}

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, categoryTitle }: DeleteConfirmProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Category">
            <div className="pt-2 space-y-6">
                <div className="flex flex-col items-center text-center space-y-3 px-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete "{categoryTitle}"?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            This will also delete <strong>all nested subcategories</strong> and transactions involved.
                            This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={onClose} className="w-full py-3 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="w-full py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/20">
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Category Row Component (Dumb UI) ---
interface CategoryRowProps {
    category: Category;
    onUpdate: (id: string, updates: Partial<Category>) => void;
    onDeleteRaw?: (id: string) => void;
    onAddSub?: (parentId: string) => void;
    onRequestDelete?: (category: Category) => void;
    isSubcategory?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    hasSubcategories?: boolean;
    disabled?: boolean; // Added for drag disabling

    // Drag Props
    dragAttributes?: any;
    dragListeners?: any;
}

const CategoryRow = ({
    category, onUpdate, onDeleteRaw, onAddSub, onRequestDelete,
    isSubcategory = false, isExpanded = false, onToggleExpand, hasSubcategories = false,
    dragAttributes, dragListeners
}: CategoryRowProps) => {
    const [isEditingTitle, setIsEditingTitle] = useState(category.isNew || false);
    const [title, setTitle] = useState(category.title);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const IconComponent = getIconComponent(category.icon);

    useEffect(() => {
        if ((isEditingTitle || category.isNew) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingTitle, category.isNew]);

    const handleTitleSubmit = () => {
        setIsEditingTitle(false);
        if (title.trim() !== category.title || category.isNew) {
            if (title.trim() === '' && category.isNew && onDeleteRaw) {
                onDeleteRaw(category.id);
            } else if (title.trim() !== '') {
                onUpdate(category.id, { title: title.trim() });
            } else {
                setTitle(category.title);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTitleSubmit();
        } else if (e.key === 'Escape') {
            setIsEditingTitle(false);
            setTitle(category.title);
            if (category.isNew && onDeleteRaw) {
                onDeleteRaw(category.id);
            }
        }
    };

    return (
        <div
            className={`
                group flex justify-between items-center px-3 py-2 transition-all duration-200
                ${isSubcategory
                    ? 'pl-10 pr-4 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-xl'}
            `}
        >
            <div className="flex items-center gap-2 w-full min-w-0">
                {/* Drag Handle */}
                <button
                    {...dragAttributes}
                    {...dragListeners}
                    className={`
                        p-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing outline-none
                        ${category.isNew ? 'opacity-0 cursor-default' : ''}
                    `}
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="relative shrink-0">
                    <button
                        ref={triggerRef}
                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                        className={`
                            p-1.5 rounded-lg transition-colors
                            ${category.type === 'income'
                                ? 'bg-green-50 text-green-600 dark:bg-green-900/20 hover:bg-green-100'
                                : 'bg-red-50 text-red-600 dark:bg-red-900/20 hover:bg-red-100'}
                        `}
                    >
                        <IconComponent className={isSubcategory ? "w-3.5 h-3.5" : "w-4 h-4"} />
                    </button>
                    <IconPickerPopover
                        isOpen={isIconPickerOpen}
                        currentIcon={category.icon || 'shopping-bag'}
                        onClose={() => setIsIconPickerOpen(false)}
                        onSelect={(newIcon) => {
                            onUpdate(category.id, { icon: newIcon });
                            setIsIconPickerOpen(false);
                        }}
                        triggerRef={triggerRef as React.RefObject<HTMLElement>}
                    />
                </div>

                {/* Inline Title Edit */}
                <div className="flex-1 min-w-0">
                    {isEditingTitle ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={`
                                w-full bg-transparent border-0 border-b border-blue-500 focus:ring-0 px-0 py-0.5
                                ${isSubcategory ? 'text-sm font-normal text-gray-700 dark:text-gray-300' : 'text-sm font-medium text-gray-900 dark:text-white'}
                            `}
                            placeholder={isSubcategory ? "Subcategory" : "Category"}
                        />
                    ) : (
                        <div
                            onClick={() => setIsEditingTitle(true)}
                            className={`
                                cursor-text truncate transition-colors
                                hover:text-blue-600 dark:hover:text-blue-400
                                ${isSubcategory
                                    ? 'text-sm font-normal text-gray-600 dark:text-gray-400'
                                    : 'text-sm font-medium text-gray-900 dark:text-white'}
                            `}
                        >
                            {category.title}
                        </div>
                    )}
                </div>

                {/* Actions (Left of Toggle) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                    {!isSubcategory && onAddSub && (
                        <button
                            onClick={() => onAddSub(category.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Add Subcategory"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onRequestDelete && (
                        <button
                            onClick={() => onRequestDelete(category)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Toggle Arrow (Right Most) */}
                {!isSubcategory && hasSubcategories && (
                    <div className="w-6 flex justify-center">
                        <button
                            onClick={onToggleExpand}
                            className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sortable Child Wrapper ---
const SortableChildRow = (props: CategoryRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: props.category.id,
        disabled: props.category.isNew || props.disabled // Added props.disabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative' as 'relative',
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <CategoryRow {...props} dragAttributes={attributes} dragListeners={listeners} />
        </div>
    );
};


// --- Sortable Parent Wrapper ---
interface CategoryTreeItemProps {
    category: Category;
    onUpdate: (id: string, updates: Partial<Category>) => void;
    onDeleteRaw: (id: string) => void;
    onAddSub: (parentId: string) => void;
    onRequestDelete: (category: Category) => void;
    onReorderSub: (parentId: string, newOrderIds: string[]) => void; // Added
}

const CategoryTreeItem = ({ category, onUpdate, onDeleteRaw, onAddSub, onRequestDelete, onReorderSub }: CategoryTreeItemProps) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null); // State for inner DragOverlay

    // Outer Sortable Logic (for reordering parent categories)
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: category.id,
        disabled: category.isNew
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        // Ensure z-index is high when dragging to appear above other rows
        zIndex: isDragging ? 50 : 1,
        position: 'relative' as 'relative',
    };

    // Inner Dnd Logic (for reordering subcategories)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const subcats = category.subcategories
        ? [...category.subcategories].sort((a, b) => a.sort_order - b.sort_order)
        : [];

    // Only enable dragging for subcategories if there's more than one
    const isSubDragEnabled = subcats.length > 1;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = subcats.findIndex(c => c.id === active.id);
            const newIndex = subcats.findIndex(c => c.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrderIds = arrayMove(subcats, oldIndex, newIndex).map(c => c.id);
                onReorderSub(category.id, newOrderIds);
            }
        }
    };

    // Find the active subcategory for the DragOverlay
    const activeSub = activeId ? subcats.find(c => c.id === activeId) : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl mb-3"
        >
            <CategoryRow
                category={category}
                onUpdate={onUpdate}
                onDeleteRaw={onDeleteRaw}
                onAddSub={onAddSub}
                onRequestDelete={onRequestDelete}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                hasSubcategories={subcats.length > 0}
                dragAttributes={attributes}
                dragListeners={listeners}
                isSubcategory={false}
            />

            {isExpanded && subcats.length > 0 && (
                <div className="flex flex-col border-t border-gray-100 dark:border-gray-700">
                    {/* Inner DndContext for subcategories */}
                    <DndContext
                        sensors={sensors}
                        modifiers={[restrictToVerticalAxis]}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            id={`sub-${category.id}`}
                            items={subcats.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="pb-1 bg-gray-50/30 dark:bg-gray-900/10">
                                {subcats.map(sub => (
                                    <SortableChildRow
                                        key={sub.id}
                                        category={sub}
                                        onUpdate={onUpdate}
                                        onDeleteRaw={onDeleteRaw}
                                        onRequestDelete={onRequestDelete}
                                        isSubcategory={true}
                                        disabled={!isSubDragEnabled} // Disable drag if only one subcategory
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        <DragOverlay modifiers={[restrictToVerticalAxis]}>
                            {activeSub ? (
                                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-lg overflow-hidden opacity-95 pointer-events-none">
                                    <CategoryRow
                                        category={activeSub}
                                        onUpdate={() => { }}
                                        isSubcategory={true}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            )}
        </div>
    );
};


const Categories: React.FC = () => {
    const queryClient = useQueryClient();
    const [sortedCategories, setSortedCategories] = useState<Category[]>([]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    // 1. Add activeId state
    const [activeId, setActiveId] = useState<string | null>(null);

    const { data: categories = [], isSuccess } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    // Helper to find a category by ID recursively
    const findCategory = useCallback((id: string, list: Category[] = sortedCategories): Category | undefined => {
        for (const item of list) {
            if (item.id === id) return item;
            if (item.subcategories) {
                const found = findCategory(id, item.subcategories);
                if (found) return found;
            }
        }
        return undefined;
    }, [sortedCategories]);

    // 2. Derive activeCategory
    const activeCategory = activeId ? findCategory(activeId) : null;

    useEffect(() => {
        if (isSuccess && categories) {
            setSortedCategories(prev => {
                const newItems = prev.filter(p => p.isNew);
                const merged = JSON.parse(JSON.stringify(categories));

                const attachNewChild = (parentId: string, child: Category) => {
                    const parent = merged.find((c: Category) => c.id === parentId);
                    if (parent) {
                        if (!parent.subcategories) parent.subcategories = [];
                        if (!parent.subcategories.find((c: Category) => c.id === child.id)) {
                            parent.subcategories.push(child);
                        }
                    }
                };

                const topLevelNew = newItems.filter(c => !c.parent_category_id);
                const childNew = newItems.filter(c => c.parent_category_id);

                childNew.forEach(child => {
                    if (child.parent_category_id) attachNewChild(child.parent_category_id, child);
                });

                return [...merged, ...topLevelNew];
            });
        }
    }, [categories, isSuccess]);

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Category> }) => {
            let target: Category | undefined;
            const findRecursive = (cats: Category[]) => {
                for (const cat of cats) {
                    if (cat.id === id) return cat;
                    if (cat.subcategories) {
                        const found = findRecursive(cat.subcategories);
                        if (found) return found;
                    }
                }
            };
            target = findRecursive(sortedCategories);

            if (target?.isNew) {
                return await api.post('/categories', {
                    title: updates.title || target.title,
                    type: target.type,
                    icon: updates.icon || target.icon,
                    parent_category_id: target.parent_category_id
                });
            } else {
                return await api.patch(`/categories/${id}`, updates);
            }
        },
        onSuccess: (data, variables) => {
            if (variables.id.startsWith('temp-')) {
                setSortedCategories(prev => {
                    const clean = (cats: Category[]): Category[] => {
                        return cats
                            .filter(c => c.id !== variables.id)
                            .map(c => ({
                                ...c,
                                subcategories: c.subcategories ? clean(c.subcategories) : []
                            }));
                    };
                    return clean(prev);
                });
            }
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error: any) => {
            alert("Error saving: " + (error.response?.data?.detail || error.message));
        }
    });

    const reorderMutation = useMutation({
        mutationFn: async (orderedIds: string[]) => {
            const validIds = orderedIds.filter(id => !id.startsWith('temp-'));
            return await api.put('/categories/order', validIds);
        },
        onSuccess: () => {
            // success
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await api.delete(`/categories/${id}`);
        },
        onSuccess: (_data, variables) => {
            const id = variables;
            setSortedCategories(prev => {
                const clean = (cats: Category[]): Category[] => {
                    return cats
                        .filter(c => c.id !== id)
                        .map(c => ({
                            ...c,
                            subcategories: c.subcategories ? clean(c.subcategories) : []
                        }));
                };
                return clean(prev);
            });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
        },
        onError: (error: any) => {
            alert("Error deleting: " + (error.response?.data?.detail || error.message));
        }
    });

    const handleUpdate = (id: string, updates: Partial<Category>) => {
        const deepUpdate = (cats: Category[]): Category[] => {
            return cats.map(c => {
                if (c.id === id) return { ...c, ...updates };
                if (c.subcategories) return { ...c, subcategories: deepUpdate(c.subcategories) };
                return c;
            });
        };
        setSortedCategories(prev => deepUpdate(prev));
        updateMutation.mutate({ id, updates });
    };

    const handleAdd = (type: 'income' | 'expense') => {
        const newItem: Category = {
            id: `temp-${Date.now()}`,
            title: '',
            type,
            icon: 'shopping-bag',
            slug: '',
            sort_order: 9999,
            isNew: true,
            subcategories: []
        };
        setSortedCategories(prev => [...prev, newItem]);
    };

    const handleAddSub = (parentId: string) => {
        let parentType: 'income' | 'expense' = 'expense';
        const findParent = (cats: Category[]) => {
            for (const c of cats) {
                if (c.id === parentId) {
                    parentType = c.type;
                    return;
                }
                if (c.subcategories) findParent(c.subcategories);
            }
        };
        findParent(sortedCategories);

        const newItem: Category = {
            id: `temp-${Date.now()}`,
            title: '',
            type: parentType,
            icon: 'shopping-bag',
            slug: '',
            sort_order: 9999,
            isNew: true,
            parent_category_id: parentId
        };

        setSortedCategories(prev => prev.map(c => {
            if (c.id === parentId) {
                return { ...c, subcategories: [...(c.subcategories || []), newItem] };
            }
            return c;
        }));
    };

    const handleDeleteRaw = (id: string) => {
        setSortedCategories(prev => {
            const clean = (cats: Category[]): Category[] => {
                return cats
                    .filter(c => c.id !== id)
                    .map(c => ({
                        ...c,
                        subcategories: c.subcategories ? clean(c.subcategories) : []
                    }));
            };
            return clean(prev);
        });
    };

    const onRequestDelete = (cat: Category) => {
        if (cat.isNew) {
            handleDeleteRaw(cat.id);
        } else {
            setCategoryToDelete(cat);
            setDeleteModalOpen(true);
        }
    };

    const onConfirmDelete = () => {
        if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleReorderSub = (parentId: string, newOrderIds: string[]) => {
        setSortedCategories(prev => {
            const deepUpdate = (items: Category[]): Category[] => {
                return items.map(c => {
                    if (c.id === parentId) {
                        const subMap = new Map(c.subcategories?.map(s => [s.id, s]));
                        const newSub = newOrderIds.map((id, idx) => {
                            const s = subMap.get(id);
                            if (s) return { ...s, sort_order: idx };
                            return s!;
                        }).filter(Boolean) as Category[];
                        return { ...c, subcategories: newSub };
                    }
                    if (c.subcategories) {
                        return { ...c, subcategories: deepUpdate(c.subcategories) };
                    }
                    return c;
                });
            };
            return deepUpdate(prev);
        });
        reorderMutation.mutate(newOrderIds);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        // Global logic only for Parents now (since children are isolated)
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        if (active.id !== over.id) {
            setSortedCategories((prev) => {
                // ... same logic but likely only top-level swaps ...
                // Reusing the recursive finder is fine.
                const newCats = JSON.parse(JSON.stringify(prev));
                const findListContainer = (list: Category[], id: string): Category[] | null => {
                    if (list.find(c => c.id === id)) return list;
                    for (const c of list) {
                        if (c.subcategories) {
                            const found = findListContainer(c.subcategories, id);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const sourceList = findListContainer(newCats, active.id as string);
                const targetList = findListContainer(newCats, over.id as string);

                if (sourceList && targetList && sourceList === targetList) {
                    // ... swap ...
                    const oldIndex = sourceList.findIndex((c) => c.id === active.id);
                    const newIndex = sourceList.findIndex((c) => c.id === over.id);

                    const sortedList = arrayMove(sourceList, oldIndex, newIndex);
                    sortedList.forEach((item, idx) => item.sort_order = idx);

                    reorderMutation.mutate(sortedList.map(c => c.id));
                    sourceList.splice(0, sourceList.length, ...sortedList);

                    return newCats;
                }
                return prev;
            });
        }
    };

    const incomeCategories = sortedCategories.filter((c) => c.type === 'income') || [];
    const expenseCategories = sortedCategories.filter((c) => c.type === 'expense') || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Categories</h1>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Organize your finances structure.</p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Expense Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b-2 border-red-100 dark:border-red-900/30">
                            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <ArrowDownCircle className="w-5 h-5" /> Expenses
                            </h2>
                            <button onClick={() => handleAdd('expense')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Plus className="w-5 h-5 text-gray-400 hover:text-red-600" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <SortableContext items={expenseCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                {expenseCategories.map((cat) => (
                                    <CategoryTreeItem
                                        key={cat.id} category={cat}
                                        onUpdate={handleUpdate} onDeleteRaw={handleDeleteRaw}
                                        onAddSub={handleAddSub} onRequestDelete={onRequestDelete}
                                        onReorderSub={handleReorderSub}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                    </div>

                    {/* Income Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b-2 border-green-100 dark:border-green-900/30">
                            <h2 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                                <ArrowUpCircle className="w-5 h-5" /> Income
                            </h2>
                            <button onClick={() => handleAdd('income')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Plus className="w-5 h-5 text-gray-400 hover:text-green-600" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <SortableContext items={incomeCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                {incomeCategories.map((cat) => (
                                    <CategoryTreeItem
                                        key={cat.id} category={cat}
                                        onUpdate={handleUpdate} onDeleteRaw={handleDeleteRaw}
                                        onAddSub={handleAddSub} onRequestDelete={onRequestDelete}
                                        onReorderSub={handleReorderSub}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                    </div>
                </div>

                <DragOverlay modifiers={[restrictToVerticalAxis]}>
                    {activeCategory ? (
                        <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900 shadow-2xl rounded-xl overflow-hidden opacity-90 scale-105 pointer-events-none">
                            <CategoryRow
                                category={activeCategory}
                                onUpdate={() => { }}
                                onDeleteRaw={() => { }}
                                isSubcategory={!!activeCategory.parent_category_id}
                                isExpanded={false}
                                hasSubcategories={(activeCategory.subcategories?.length || 0) > 0}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                categoryTitle={categoryToDelete?.title || ''}
            />
        </div>
    );
};

export default Categories;
