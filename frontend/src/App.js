import React, {useContext} from 'react';
import {BrowserRouter as Router, Routes, Route, NavLink} from 'react-router-dom';
import {Navbar, Nav, Button, Container} from 'react-bootstrap';
import {ApiKeyContext} from './ApiKeyProvider';
import 'bootstrap/dist/css/bootstrap.min.css';

import Bill from './components/Bill';
import Budget from './components/Budget';
import Category from './components/Category';
import User from './components/User';
import Transaction from './components/Transaction';
import ProtectedRoute from './components/ProtectedRoute';
import {Helmet} from "react-helmet"; // Import the ProtectedRoute component

function App() {
    const {isAuthenticated, authorize, logout} = useContext(ApiKeyContext);

    return (
        <Router>
            <Helmet>
                <title>XPNSR</title>
            </Helmet>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={NavLink} to="/">XPNSR</Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarNav"/>
                    <Navbar.Collapse id="navbarNav">
                        <Nav className="me-auto">
                            {isAuthenticated && (
                                <>
                                    <Nav.Link as={NavLink} to="/bills" activeClassName="active">Bills</Nav.Link>
                                    <Nav.Link as={NavLink} to="/budgets" activeClassName="active">Budgets</Nav.Link>
                                    <Nav.Link as={NavLink} to="/categories" activeClassName="active">Categories</Nav.Link>
                                    <Nav.Link as={NavLink} to="/transactions"
                                              activeClassName="active">Transactions</Nav.Link>
                                    <Nav.Link as={NavLink} to="/users" activeClassName="active">Users</Nav.Link>

                                </>
                            )}
                        </Nav>
                        <div className="d-flex">
                            {isAuthenticated ? (
                                <Button variant="outline-light" size="sm" onClick={logout}>Logout</Button>
                            ) : (
                                <Button variant="outline-success" size="sm" onClick={authorize}>Authorize</Button>
                            )}
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-3">
                <Routes>
                    <Route path="/bills" element={<ProtectedRoute><Bill/></ProtectedRoute>}/>
                    <Route path="/budgets" element={<ProtectedRoute><Budget/></ProtectedRoute>}/>
                    <Route path="/categories" element={<ProtectedRoute><Category/></ProtectedRoute>}/>
                    <Route path="/transactions" element={<ProtectedRoute><Transaction/></ProtectedRoute>}/>
                    <Route path="/users" element={<ProtectedRoute><User/></ProtectedRoute>}/>
                </Routes>
            </Container>
        </Router>
    );
}

export default App;