import React, {useState, useEffect, useContext} from 'react';
import {Container, Row, Col, Table, Spinner, Alert, Button} from 'react-bootstrap';
import {ApiKeyContext} from '../ApiKeyProvider';
import {fetchCategories} from '../api/CategoryApi';
import useFetchData from '../hooks/UseFetchData';

function Category() {
    const {isAuthenticated} = useContext(ApiKeyContext);
    const {
        data: categories,
        loading: categoriesLoading,
        error: categoriesError,
        reload: loadCategories
    } = useFetchData(fetchCategories, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            loadCategories();
        }
    }, [isAuthenticated, loadCategories]);

    useEffect(() => {
        if (categoriesError) {
            handleError('Error fetching categories.');
        }
    }, [categoriesError]);

    const handleError = (message) => {
        console.error(message);
    };

    return (
        <Container className="mt-3">
            <Row>
                <Col md={12} className="d-flex justify-content-end">
                    <Button variant="primary" className="my-3 me-2 btn-sm" disabled>
                        Add
                    </Button>
                    <Button variant="outline-dark" className="my-3 btn-sm" disabled>
                        Export
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    {categoriesLoading ? (
                        <Spinner animation="border"/>
                    ) : categories.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Icon</th>
                                <th>Description</th>
                                <th>Parent ID</th>
                            </tr>
                            </thead>
                            <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>
                                    <td>{category.name}</td>
                                    <td>{category.type}</td>
                                    <td>{category.icon}</td>
                                    <td>{category.description}</td>
                                    <td>{category.parentId}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert key='info' variant='info'>
                            No categories available.
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default Category;
