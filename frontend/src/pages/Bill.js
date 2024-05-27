import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Bill() {
    // Stating variables for managing bills
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false); 
    const [editingBillId, setEditingBillId] = useState(null);
    const [editFormData, setEditFormData] = useState({ tenure: '', amount: '' });
    const [newBillData, setNewBillData] = useState({
        tenure: '',
        amount: '',
        categoryId: 'dining_out', 
    });

    const navigate = useNavigate();

    // For fetching bills from the API
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
            setBills(data.content);
        } catch (error) {
            console.error('There was an error fetching the bills:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
      fetchBills(); 
  }, []);
    //  For handling edit button click

    const handleEditClick = (bill) => {
        setEditingBillId(bill.id);
        setEditFormData({ tenure: bill.tenure, amount: bill.amount });
    };
    //  To Delete a bill

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
//  For handling changes in the edit form
    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({ ...editFormData, [name]: value });
    };
// For handling the submission of the edit form

    const handleEditFormSubmit = async (event) => {
        event.preventDefault();

        const editedBill = {
            id: editingBillId,
            tenure: parseInt(editFormData.tenure, 10),
            amount: parseFloat(editFormData.amount), 
            categoryId: "dining_out" 
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

           
            await fetchBills();
            setEditingBillId(null); 
            navigate('/bill'); 
        } catch (error) {
            console.error('There was an error updating the bill:', error);
        }
    };


    // For handling the changes in the add form
    const handleAddFormChange = (event) => {
        const { name, value } = event.target;
        setNewBillData({ ...newBillData, [name]: value });
    };

        // Handling the submission of the add form

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
            await fetchBills(); 
            setShowAddForm(false); 
            navigate('/bill'); 
        } catch (error) {
            console.error('There was an error adding the bill:', error);
        }
    };

    useEffect(() => {
       
    }, []);

    return (
        <div>
            {/*<button className="btn btn-primary my-3" onClick={fetchBills}>Show All Bills</button>*/}
            <button className="btn btn-secondary my-3" onClick={() => setShowAddForm(!showAddForm)}>Add Bill</button>
            <a href="http://localhost:5000/generate/report/bills" className="btn btn-primary my-3">Export CSV</a>

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
