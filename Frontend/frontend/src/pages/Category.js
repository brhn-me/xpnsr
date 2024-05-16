
import React, { useState, useEffect } from 'react';

function Category() {
    const [categorys, setCategorys] = useState([]);
    const [loading, setLoading] = useState(false);

   
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

            
            setCategorys(data.content);
        } catch (error) {
            console.error('There was an error fetching the categorys:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorys();
        
    }, []);

   
    const handleEdit = (categoryId) => {
        console.log('Edit', categoryId);
      
    };

    const handleDelete = (categoryId) => {
        console.log('Delete', categoryId);
        
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
