import {apiRequest} from './ApiRequest';

const categoryApiUrl = 'api/categories/';

export const fetchCategories = async (page = 0, size = 20) => {
    return apiRequest({
        url: `${categoryApiUrl}/?page=${page}&size=${size}`,
        method: 'GET'
    });
};
