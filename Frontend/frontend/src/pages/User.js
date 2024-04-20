// src/pages/user.js
import React, { useState, useEffect } from 'react';

function User() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to fetch users from the API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users/?page=0&size=1', {
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

            // Assuming users are stored in the `content` property of the response
            setUsers(data.content);
        } catch (error) {
            console.error('There was an error fetching the users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // You could also call fetchusers here directly if you want to load users as soon as the component mounts
    }, []);

    // Placeholder functions for edit and delete actions
    const handleEdit = (userId) => {
        console.log('Edit', userId);
        // Implement your edit logic here
    };

    const handleDelete = (userId) => {
        console.log('Delete', userId);
        // Implement your delete logic here
    };

    return (
        <div>
            <button className="btn btn-primary my-3" onClick={fetchUsers}>Show All users</button>
            {loading && <p>Loading...</p>}
            {!loading && (
                <ul className="list-group">
                    {users.map((user, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            Name : {user.firstName} {user.lastName} - Email : {user.email}
                            <div>
                                <button className="btn btn-info btn-sm mr-2" onClick={() => handleEdit(user.id)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default User;
