import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Bill from './pages/Bill';
import Budget from './pages/Budget';
import Category from './pages/Category';
import User from './pages/User';
import Transaction from './pages/Transaction';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <div>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/bill">Bill</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/budget">Budget</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/category">Category</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/user">User</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/transaction">Transaction</Link>
                            </li>
                        </ul>
                    </div>
                </nav>


                <Routes>
                    <Route path="/bill" element={<Bill />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/category" element={<Category />} />
                    <Route path="/user" element={<User />} />
                    <Route path="/transaction" element={<Transaction />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
