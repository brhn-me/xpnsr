import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function Bill() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingBillId, setEditingBillId] = useState(null);
    const [editFormData, setEditFormData] = useState({ tenure: '', amount: '' });
    const navigate = useNavigate(); // Initialize navigate for later use

    // Function to fetch bills from the API
    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/bills/?page=0&size=20', {
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
            setBills(data.content); // Assuming the response has a 'content' field containing the bills
        } catch (error) {
            console.error('There was an error fetching the bills:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills(); // Fetch bills when component mounts
    }, []);

    const handleEditClick = (bill) => {
        setEditingBillId(bill.id);
        setEditFormData({ tenure: bill.tenure, amount: bill.amount });
    };

    const handleDelete = async (billId) => {
        try {
            const response = await fetch(`/api/bills/${billId}`, {
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
            const response = await fetch(`/api/bills/${editingBillId}`, {
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

    return (
        <div>
            <button className="btn btn-primary my-3" onClick={fetchBills}>Show All Bills</button>
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
