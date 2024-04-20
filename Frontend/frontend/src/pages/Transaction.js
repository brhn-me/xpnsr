// src/pages/transaction.js
import React, { useState, useEffect } from 'react';

function Transaction() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to fetch transactions from the API
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/transactions/?page=0&size=20', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Assuming transactions are stored in the `content` property of the response
            setTransactions(data.content);
        } catch (error) {
            console.error('There was an error fetching the transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // You could also call fetchtransactions here directly if you want to load transactions as soon as the component mounts
    }, []);

    // Placeholder functions for edit and delete actions
    const handleEdit = (transactionId) => {
        console.log('Edit', transactionId);
        // Implement your edit logic here
    };

    const handleDelete = (transactionId) => {
        console.log('Delete', transactionId);
        // Implement your delete logic here
    };

    return (
        <div>
            <button className="btn btn-primary my-3" onClick={fetchTransactions}>Show All transactions</button>
            {loading && <p>Loading...</p>}
            {!loading && (
                <ul className="list-group">
                    {transactions.map((transaction, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            Date : {transaction.date} Type: {transaction.type} - Description : {transaction.description}
                            <div>
                                <button className="btn btn-info btn-sm mr-2" onClick={() => handleEdit(transaction.id)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(transaction.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Transaction;
