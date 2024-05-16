import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Transaction() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState(null);
    const [transactionData, setTransactionData] = useState({
        date: '',
        type: '',
        primaryCategoryId: '',
        secondaryCategoryId: '',
        amount: '',
        due: '',
        currency: '',
        city: '',
        country: '',
        title: '',
        description: '',
        tags: ''
    });

    const navigate = useNavigate();

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/transactions/?page=0&size=20', {
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
            setTransactions(data.content);
        } catch (error) {
            console.error('There was an error fetching the transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAddFormChange = (event) => {
        const { name, value } = event.target;
        setTransactionData({ ...transactionData, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const method = editingTransactionId ? 'PUT' : 'POST';
        const url = editingTransactionId ? `http://localhost:8080/api/transactions/${editingTransactionId}` : 'http://localhost:8080/api/transactions/';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                },
                body: JSON.stringify(transactionData)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await fetchTransactions();
            setShowAddForm(false);
            setEditingTransactionId(null);
            navigate('/transaction'); 
        } catch (error) {
            console.error('There was an error submitting the transaction:', error);
        }
    };

    const handleEditClick = (transaction) => {
        setEditingTransactionId(transaction.id);
        setTransactionData({...transaction});
        setShowAddForm(true);
    };

    const handleDelete = async (transactionId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await fetchTransactions();
        } catch (error) {
            console.error('There was an error deleting the transaction:', error);
        }
    };

    return (
        <div>
            {/*<button className="btn btn-primary my-3" onClick={fetchTransactions}>Show All Transactions</button>*/}
            <button className="btn btn-secondary my-3" onClick={() => {
                setEditingTransactionId(null);
                setTransactionData({
                    date: '',
                    type: '',
                    primaryCategoryId: '',
                    secondaryCategoryId: '',
                    amount: '',
                    due: '',
                    currency: '',
                    city: '',
                    country: '',
                    title: '',
                    description: '',
                    tags: ''
                });
                setShowAddForm(!showAddForm);
            }}>{showAddForm ? 'Cancel' : 'Add Transaction'}</button>

            {showAddForm && (
                <form onSubmit={handleSubmit}  method= "POST" action="profile/proffesional" modelattribute="PROFESSIONAL">
                    <input type="date" name="date" placeholder="Date" value={transactionData.date} onChange={handleAddFormChange} required />
                    <select name="type" value={transactionData.type} onChange={handleAddFormChange} required>
                        <option value="">Select Type</option>
                        <option value="EARNING">Earning</option>
                        <option value="EXPENSE">Expense</option>
                    </select>
                    <input type="text" name="primaryCategoryId" placeholder="Primary Category ID" value={transactionData.primaryCategoryId} onChange={handleAddFormChange} required />
                    <input type="text" name="secondaryCategoryId" placeholder="Secondary Category ID" value={transactionData.secondaryCategoryId} onChange={handleAddFormChange} />
                    <input type="number" name="amount" placeholder="Amount" value={transactionData.amount} onChange={handleAddFormChange} required />
                    <input type="number" name="due" placeholder="Due Amount" value={transactionData.due} onChange={handleAddFormChange} />
                    <input type="text" name="currency" placeholder="Currency" value={transactionData.currency} onChange={handleAddFormChange} />
                    <input type="text" name="city" placeholder="City" value={transactionData.city} onChange={handleAddFormChange} />
                    <input type="text" name="country" placeholder="Country" value={transactionData.country} onChange={handleAddFormChange} />
                    <input type="text" name="title" placeholder="Title" value={transactionData.title} onChange={handleAddFormChange} />
                    <input type="text" name="description" placeholder="Description" value={transactionData.description} onChange={handleAddFormChange} />
                    <input type="text" name="tags" placeholder="Tags" value={transactionData.tags} onChange={handleAddFormChange} />
                    <button type="submit" className="btn btn-success">{editingTransactionId ? 'Save Changes' : 'Add Transaction'}</button>
                </form>
            )}

            {loading && <p>Loading...</p>}
            {!loading && transactions.map((transaction) => (
                <div key={transaction.id} className="list-group-item">
                    Date: {transaction.date.split('T')[0]}, Type: {transaction.type}, Amount: ${transaction.amount}, Primary Category: {transaction.primaryCategoryId}
                    <button className="btn btn-info btn-sm" onClick={() => handleEditClick(transaction)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(transaction.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default Transaction;
