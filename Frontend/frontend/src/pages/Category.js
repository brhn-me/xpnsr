// src/pages/category.js
import React, { useState, useEffect } from 'react';

function Category() {
    const [categorys, setCategorys] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to fetch categorys from the API
    const fetchCategorys = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/categories/?page=0&size=20', {
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

            // Assuming categorys are stored in the `content` property of the response
            setCategorys(data.content);
        } catch (error) {
            console.error('There was an error fetching the categorys:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorys();
        // You could also call fetchcategorys here directly if you want to load categorys as soon as the component mounts
    }, []);

    // Placeholder functions for edit and delete actions
    const handleEdit = (categoryId) => {
        console.log('Edit', categoryId);
        // Implement your edit logic here
    };

    const handleDelete = (categoryId) => {
        console.log('Delete', categoryId);
        // Implement your delete logic here
    };

    return (
        <div>
            {/*<button className="btn btn-primary my-3" onClick={fetchCategorys}>Show All Categorys</button>*/}
            {loading && <p>Loading...</p>}
            {!loading && (
                <ul className="list-group">
                    {categorys.map((category, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            Name : {category.name} - Type : {category.type} - Icon : {category.icon} - Description : {category.description}
                            {/*<div>*/}
                            {/*    <button className="btn btn-info btn-sm mr-2" onClick={() => handleEdit(category.id)}>Edit</button>*/}
                            {/*    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(category.id)}>Delete</button>*/}
                            {/*</div>*/}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Category;
