import {getApiKey} from '../ApiKeyProvider';

const getHeaders = (contentType = 'application/json') => {
    const apiKey = getApiKey();
    return {
        'X-Requested-With': 'XMLHttpRequest',
        'accept': 'application/json',
        'XPNSR-API-KEY': apiKey,
        ...(contentType && {'Content-Type': contentType})
    };
};

class ApiError extends Error {
    constructor(message, response, stack) {
        super(message);
        this.name = "ApiError";
        this.response = response;
        if (stack) {
            this.stack = stack;
        }
    }
}

export const apiRequest = async ({url, method, body = null, contentType = 'application/json'}) => {
    const options = {
        method,
        headers: getHeaders(contentType),
        ...(body && {body: JSON.stringify(body)}),
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(`Network response error: ${response.statusText}`, response, new Error().stack);
        }
        return response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            console.error('API Error:', error.message);
            console.error('Response:', error.response);
            console.error('Stack trace:', error.stack);
        } else {
            console.error('Unexpected Error:', error);
        }
        throw error;
    }
};
