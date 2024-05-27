
import React, { useState, useEffect } from 'react';

function User() {

    // Declaring the State variables for user data and loading state

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

        // Getting users from the API

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
                throw new Error('Network response was not ok');  // for throwing an error if the response is not ok
            }
            const data = await response.json();

            
            setUsers(data.content); // Setting the user data in state
        } catch (error) {
            console.error('There was an error fetching the users:', error); //For showing any errors that occur in the Log
        } finally {
            setLoading(false);  // declaring the loading state to false after fetching data
        }
    };
// Get the users when the component mounts
    useEffect(() => {
        fetchUsers();
       
    }, []);

    //  For editing a user
    const handleEdit = (userId) => {
        console.log('Edit', userId);
        
    };
    
    // For deleting a user
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
