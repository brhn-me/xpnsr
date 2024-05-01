import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Bill() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false); // State to toggle add form visibility
    const [editingBillId, setEditingBillId] = useState(null);
    const [editFormData, setEditFormData] = useState({ tenure: '', amount: '' });
    const [newBillData, setNewBillData] = useState({
        tenure: '',
        amount: '',
        categoryId: 'dining_out', // Defaulting to 'dining_out', adjust as needed
    });

    const navigate = useNavigate();

    // Function to fetch bills from the API
    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/bills/?page=0&size=20', {
                method: 'GET',
                mode: "cors",
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'accept': 'application/json',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setBills(data.content); // Assuming the response has a 'content' field containing the bills
        } catch (error) {
            console.error('There was an error fetching the bills:', error);
        } finally {
            setLoading(false);
        }
    };

    // Existing handleEditClick, handleDelete, handleEditFormChange, handleEditFormSubmit functions

    useEffect(() => {
      fetchBills(); // Fetch bills when component mounts
  }, []);

    const handleEditClick = (bill) => {
        setEditingBillId(bill.id);
        setEditFormData({ tenure: bill.tenure, amount: bill.amount });
    };

    const handleDelete = async (billId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/bills/${billId}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedBills = bills.filter(bill => bill.id !== billId);
            setBills(updatedBills);
        } catch (error) {
            console.error('There was an error deleting the bill:', error);
        }
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleEditFormSubmit = async (event) => {
        event.preventDefault();

        const editedBill = {
            id: editingBillId,
            tenure: parseInt(editFormData.tenure, 10), // Ensure tenure is an integer
            amount: parseFloat(editFormData.amount), // Ensure amount is a float
            categoryId: "dining_out" // Assuming categoryId remains unchanged or is handled separately
        };

        try {
            const response = await fetch(`http://localhost:8080/api/bills/${editingBillId}`, {
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                },
                body: JSON.stringify(editedBill)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // On successful update, re-fetch bills to show updated data
            await fetchBills();
            setEditingBillId(null); // Reset editing state
            navigate('/bill'); // Redirect or simply refresh the bills list page
        } catch (error) {
            console.error('There was an error updating the bill:', error);
        }
    };



    const handleAddFormChange = (event) => {
        const { name, value } = event.target;
        setNewBillData({ ...newBillData, [name]: value });
    };

    const handleAddBill = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/bills/', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'XPNSR-API-KEY': 'c779c66a194f4ddfbc22a9e2dacb5835'
                },
                body: JSON.stringify(newBillData)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await fetchBills(); // Refresh the list of bills
            setShowAddForm(false); // Hide the add form
            navigate('/bill'); // Redirect or refresh the bills list page
        } catch (error) {
            console.error('There was an error adding the bill:', error);
        }
    };

    useEffect(() => {
        // Existing useEffect for fetchBills
    }, []);

    return (
        <div>
            {/*<button className="btn btn-primary my-3" onClick={fetchBills}>Show All Bills</button>*/}
            <button className="btn btn-secondary my-3" onClick={() => setShowAddForm(!showAddForm)}>Add Bill</button>

            {showAddForm && (
                <form onSubmit={handleAddBill}>

                    <input type="number" name="tenure" placeholder="Tenure" value={newBillData.tenure} onChange={handleAddFormChange} required />
                    <input type="number" name="amount" placeholder="Amount" value={newBillData.amount} onChange={handleAddFormChange} required />
                    <input type="text" name="categoryId" placeholder="Category ID" value={newBillData.categoryId} onChange={handleAddFormChange} required />
                    <button type="submit" className="btn btn-success">Add</button>
                </form>
            )}

            {loading && <p>Loading...</p>}
            {!loading && (
                <ul className="list-group">
                    {bills.map((bill) => (
                        <li key={bill.id} className="list-group-item">
                            {editingBillId === bill.id ? (
                                <form onSubmit={handleEditFormSubmit}>
                                    <input
                                        type="number"
                                        name="tenure"
                                        value={editFormData.tenure}
                                        onChange={handleEditFormChange}
                                    />
                                    <input
                                        type="number"
                                        name="amount"
                                        value={editFormData.amount}
                                        onChange={handleEditFormChange}
                                    />
                                    <button type="submit" className="btn btn-success btn-sm">Save</button>
                                </form>
                            ) : (
                                <>
                                    Tenure: {bill.tenure} days - Amount: {bill.amount}
                                    <button className="btn btn-info btn-sm" onClick={() => handleEditClick(bill)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(bill.id)}>Delete</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Bill;
