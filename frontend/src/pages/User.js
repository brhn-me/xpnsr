
import React, { useState, useEffect } from 'react';

function User() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/users/?page=0&size=1', {
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

            
            setUsers(data.content);
        } catch (error) {
            console.error('There was an error fetching the users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
       
    }, []);

   
    const handleEdit = (userId) => {
        console.log('Edit', userId);
        
    };

    const handleDelete = (userId) => {
        console.log('Delete', userId);
      
    };

    return (
        <div>
            {/*<button className="btn btn-primary my-3" onClick={fetchUsers}>Show All users</button>*/}
            {loading && <p>Loading...</p>}
            {!loading && (
                <ul className="list-group">
                    {users.map((user, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            Name : {user.firstName} {user.lastName} - Email : {user.email}

                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default User;
