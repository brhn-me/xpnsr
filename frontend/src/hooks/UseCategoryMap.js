import {useMemo} from 'react';

const useCategoryMap = (categories) => {
    return useMemo(() => {
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.id] = category.name;
        });
        return categoryMap;
    }, [categories]);
};

export default useCategoryMap;
