// BillApi.js


import {apiRequest} from "./ApiRequest";

const apiUrl = '/api/bills';

export const fetchBills = async (page = 0, size = 20) => {
    const response = await apiRequest({
        url: `${apiUrl}/?page=${page}&size=${size}`,
        method: 'GET'
    });
    return response;
};

export const deleteBill = async (id) => {
    return apiRequest({
        url: `${apiUrl}/${id}`,
        method: 'DELETE',
        contentType: null
    });
};


export const deleteBillHM = async (hmUrl) => {
    console.log(`Deleting via hypermedia url: ${hmUrl}`)
    return apiRequest({
        url: `${hmUrl}`,
        method: 'DELETE',
        contentType: null
    });
};

export const updateBill = async (billId, bill) => {
    return apiRequest({
        url: `${apiUrl}/${billId}`,
        method: 'PUT',
        body: bill
    });
};

export const updateBillHM = async (hmUrl, bill) => {
    console.log(`Updating via hypermedia url: ${hmUrl}`)
    return apiRequest({
        url: `${hmUrl}`,
        method: 'PUT',
        body: bill
    });
};

export const addBill = async (bill) => {
    return apiRequest({
        url: apiUrl,
        method: 'POST',
        body: bill
    });
};
