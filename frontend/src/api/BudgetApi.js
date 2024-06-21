import {apiRequest} from "./ApiRequest";

const apiUrl = '/api/budgets';

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

export const deleteBudgetHM = async (hmUrl) => {
    console.log(`Deleting via hypermedia url: ${hmUrl}`);
    return apiRequest({
        url: `${hmUrl}`,
        method: 'DELETE',
        contentType: null
    });
};

export const updateBudget = async (budgetId, budget) => {
    return apiRequest({
        url: `${apiUrl}/${budgetId}`,
        method: 'PUT',
        body: budget
    });
};

export const updateBudgetHM = async (hmUrl, budget) => {
    console.log(`Updating via hypermedia url: ${hmUrl}`);
    return apiRequest({
        url: `${hmUrl}`,
        method: 'PUT',
        body: budget
    });
};

export const addBudget = async (budget) => {
    return apiRequest({
        url: apiUrl,
        method: 'POST',
        body: budget
    });
};
