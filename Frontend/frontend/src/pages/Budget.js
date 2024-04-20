// src/pages/budget.js
import React, { useState, useEffect } from 'react';

function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to fetch budgets from the API
    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/budgets/?page=0&size=1&sort=', {
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

            // Assuming budgets are stored in the `content` property of the response
            setBudgets(data.content);
        } catch (error) {
            console.error('There was an error fetching the budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // You could also call fetchbudgets here directly if you want to load budgets as soon as the component mounts
    }, []);

    // Placeholder functions for edit and delete actions
    const handleEdit = (budgetId) => {
        console.log('Edit', budgetId);
        // Implement your edit logic here
    };

    const handleDelete = (budgetId) => {
        console.log('Delete', budgetId);
        // Implement your delete logic here
    };

    return (
        <div>
            <button className="btn btn-primary my-3" onClick={fetchBudgets}>Show All budgets</button>
            {loading && <p>Loading...</p>}
            {!loading && (
                <ul className="list-group">
                    {budgets.map((budget, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            Title : {budget.title} - Description : {budget.description} Amount : {budget.amount} {budget.currency}
                            <div>
                                <button className="btn btn-info btn-sm mr-2" onClick={() => handleEdit(budget.id)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(budget.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Budget;
