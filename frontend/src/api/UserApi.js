import {apiRequest} from "./ApiRequest";

const apiUrl = '/api/users/';

export const fetchUsers = async (page = 0, size = 20) => {
    const response = await apiRequest({
        url: `${apiUrl}/?page=${page}&size=${size}`,
        method: 'GET'
    });
    return response;
};
