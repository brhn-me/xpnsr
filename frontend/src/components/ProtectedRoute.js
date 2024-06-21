import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { ApiKeyContext } from '../ApiKeyProvider';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(ApiKeyContext);

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
