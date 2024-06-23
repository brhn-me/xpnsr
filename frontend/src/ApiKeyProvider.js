import React, {createContext, useState} from 'react';

export const ApiKeyContext = createContext();

export const ApiKeyProvider = ({children}) => {
    const hardCodedApiKey = 'c779c66a194f4ddfbc22a9e2dacb5835';
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('XPNSR_API_KEY'));

    const authorize = () => {
        localStorage.setItem('XPNSR_API_KEY', hardCodedApiKey);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('XPNSR_API_KEY');
        setIsAuthenticated(false);
    };

    return (
        <ApiKeyContext.Provider value={{isAuthenticated, authorize, logout}}>
            {children}
        </ApiKeyContext.Provider>
    );
};

export const getApiKey = () => localStorage.getItem('XPNSR_API_KEY');
