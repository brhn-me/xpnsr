import {apiRequest} from "./ApiRequest";

const apiUrl = '/api/budgets/';

export const fetchBudgets = async (page = 0, size = 20) => {
    const response = await apiRequest({
        url: `${apiUrl}/?page=${page}&size=${size}`,
        method: 'GET'
    });
    return response;
};

export const deleteBudget = async (id) => {
    return apiRequest({
        url: `${apiUrl}/${id}`,
        method: 'DELETE',
        contentType: null
    });
};

export const updateBudget = async (budgetId, budget) => {
    return apiRequest({
        url: `${apiUrl}/${budgetId}`,
        method: 'PUT',
        body: {...budget, userId: 1}  // Hardcoded userId
    });
};

export const addBudget = async (budget) => {
    return apiRequest({
        url: apiUrl,
        method: 'POST',
        body: {...budget, userId: 1}  // Hardcoded userId
    });
};
