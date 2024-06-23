import React, {useState, useEffect, useContext} from 'react';
import {Container, Row, Col, Table, Spinner, Alert, Button} from 'react-bootstrap';
import {ApiKeyContext} from '../ApiKeyProvider';
import {fetchUsers} from '../api/UserApi';
import useFetchData from '../hooks/UseFetchData';

function User() {
    const {isAuthenticated} = useContext(ApiKeyContext);
    const {
        data: users,
        loading: usersLoading,
        error: usersError,
        reload: loadUsers
    } = useFetchData(fetchUsers, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            loadUsers();
        }
    }, [isAuthenticated, loadUsers]);

    useEffect(() => {
        if (usersError) {
            handleError('Error fetching users.');
        }
    }, [usersError]);

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
                    {usersLoading ? (
                        <Spinner animation="border"/>
                    ) : users.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Activated</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.activated ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert key='info' variant='info'>
                            No users available.
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default User;
