import {apiRequest} from "./ApiRequest";

const apiUrl = '/api/transactions/';

export const fetchTransactions = async (page = 0, size = 20) => {
    const response = await apiRequest({
        url: `${apiUrl}/?page=${page}&size=${size}`,
        method: 'GET'
    });
    return response;
};

export const deleteTransaction = async (id) => {
    return apiRequest({
        url: `${apiUrl}/${id}`,
        method: 'DELETE',
        contentType: null
    });
};

export const deleteTransactionHM = async (hmUrl) => {
    console.log(`Deleting via hypermedia url: ${hmUrl}`);
    return apiRequest({
        url: `${hmUrl}`,
        method: 'DELETE',
        contentType: null
    });
};

export const updateTransaction = async (transactionId, transaction) => {
    return apiRequest({
        url: `${apiUrl}/${transactionId}`,
        method: 'PUT',
        body: transaction
    });
};

export const updateTransactionHM = async (hmUrl, transaction) => {
    console.log(`Updating via hypermedia url: ${hmUrl}`);
    return apiRequest({
        url: `${hmUrl}`,
        method: 'PUT',
        body: transaction
    });
};

export const addTransaction = async (transaction) => {
    return apiRequest({
        url: apiUrl,
        method: 'POST',
        body: transaction
    });
};
