import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Budget() {
        // Stating variables for managing budgets and form visibility

    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBudgetId, setEditingBudgetId] = useState(null);
    const [budgetData, setBudgetData] = useState({
        amount: '',
        currency: '',
        title: '',
        categoryId: '',
        description: ''
    });

    const navigate = useNavigate();
// Managing the functionality of fetching budgets from the API
    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/budgets/?page=0&size=20', {
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
            setBudgets(data.content);
        } catch (error) {
            console.error('There was an error fetching the budgets:', error);
        } finally {
            setLoading(false);
        }
    };
    // Fetching budgets on the component mount
    useEffect(() => {
        fetchBudgets();
    }, []);
    //  Function to handle changes in the form fields

    const handleAddFormChange = (event) => {
        const { name, value } = event.target;
        setBudgetData({ ...budgetData, [name]: value });
    };
    //  FOr handling the submission of new budget or edited budget

    const handleAddBudget = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/budgets/', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                },
                body: JSON.stringify(budgetData)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await fetchBudgets();
            setShowAddForm(false);
            navigate('/budget');
        } catch (error) {
            console.error('There was an error adding the budget:', error);
        }
    };
    // Implementing Functionality to handle click on edit button

    const handleEditClick = (budget) => {
        setEditingBudgetId(budget.id);
        setBudgetData(budget);
        setShowAddForm(true);
    };
    // Function to handle submission of edited budget

    const handleEditBudgetSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/budgets/${editingBudgetId}`, {
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                },
                body: JSON.stringify(budgetData)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await fetchBudgets();
            setEditingBudgetId(null);
            setShowAddForm(false);
            navigate('/budget');
        } catch (error) {
            console.error('There was an error updating the budget:', error);
        }
    };
   
    //  handling deletion of a budget
    const handleDelete = async (budgetId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/budgets/${budgetId}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
            setBudgets(updatedBudgets);
        } catch (error) {
            console.error('There was an error deleting the budget:', error);
        }
    };

    return (
        <div>
            {/*<button className="btn btn-primary my-3" onClick={fetchBudgets}>Show All Budgets</button>*/}
            <button className="btn btn-secondary my-3" onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? 'Cancel' : 'Add Budget'}</button>
            <a href="http://localhost:5000/generate/report/budgets" className="btn btn-primary my-3">Export CSV</a>

            {showAddForm && (
                <form onSubmit={editingBudgetId ? handleEditBudgetSubmit : handleAddBudget}>
                    <input type="number" name="amount" placeholder="Amount" value={budgetData.amount} onChange={handleAddFormChange} required />
                    <input type="text" name="currency" placeholder="Currency" value={budgetData.currency} onChange={handleAddFormChange} />
                    <input type="text" name="title" placeholder="Title" value={budgetData.title} onChange={handleAddFormChange} required />
                    <input type="text" name="categoryId" placeholder="Category ID" value={budgetData.categoryId} onChange={handleAddFormChange} required />
                    <input type="text" name="description" placeholder="Description" value={budgetData.description} onChange={handleAddFormChange} />
                    <button type="submit" className="btn btn-success">{editingBudgetId ? 'Save Changes' : 'Add Budget'}</button>
                </form>
            )}

            {loading && <p>Loading...</p>}
            {!loading && budgets.map((budget) => (
                <div key={budget.id} className="list-group-item">
                    Title: {budget.title}, Description: {budget.description}, Amount: {budget.amount} {budget.currency}, Category ID: {budget.categoryId}
                    <button className="btn btn-info btn-sm" onClick={() => handleEditClick(budget)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(budget.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default Budget;
