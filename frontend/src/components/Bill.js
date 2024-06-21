// Bill.js

import React, {useState, useEffect, useContext} from 'react';
import {Button, Container, Row, Col, Table, Spinner, ButtonGroup, Alert} from 'react-bootstrap';
import {ApiKeyContext} from '../ApiKeyProvider';
import {fetchBills, deleteBill, updateBill, addBill} from '../api/BillApi';
import {fetchCategories} from '../api/CategoryApi';
import BillForm from '../components/BillForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ToastNotification from '../components/ToastNotification';
import useFetchData from '../hooks/UseFetchData';
import useCategoryMap from '../hooks/UseCategoryMap';

function Bill() {
    const {isAuthenticated} = useContext(ApiKeyContext);
    const {
        data: bills,
        loading: billsLoading,
        error: billsError,
        reload: loadBills
    } = useFetchData(fetchBills, [isAuthenticated]);
    const {
        data: categories,
        error: categoriesError,
        reload: loadCategories
    } = useFetchData(fetchCategories, [isAuthenticated]);

    const categoryMap = useCategoryMap(categories);

    const [showAddForm, setShowAddForm] = useState(false);
    const [billData, setBillData] = useState(initialBillData());
    const [billToDelete, setBillToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadCategories();
            loadBills();
        }
    }, [isAuthenticated, loadBills, loadCategories]);

    useEffect(() => {
        if (billsError) {
            handleError('Error fetching bills.');
        }
    }, [billsError]);

    useEffect(() => {
        if (categoriesError) {
            handleError('Error fetching categories.');
        }
    }, [categoriesError]);

    function initialBillData() {
        return {
            tenure: '',
            amount: '',
            categoryId: '',
        };
    }

    const handleFormChange = (event) => {
        const {name, value} = event.target;
        setBillData((prevData) => ({...prevData, [name]: value}));
    };

    const handleAddOrUpdateBill = async (event) => {
        event.preventDefault();
        try {
            if (billData.id) {
                await updateBill(billData.id, billData);
                setToastMessage('Bill updated successfully.');
            } else {
                await addBill(billData);
                setToastMessage('Bill added successfully.');
            }
            await loadBills();
            setShowAddForm(false);
        } catch (error) {
            handleError('Error adding/updating bill.');
        } finally {
            setShowToast(true);
        }
    };

    const handleCloseForm = () => setShowAddForm(false);
    const handleShowAddForm = () => {
        setBillData(initialBillData());
        setShowAddForm(true);
    };

    const handleShowEditForm = (bill) => {
        setBillData({
            id: bill.id,
            tenure: bill.tenure,
            amount: bill.amount,
            categoryId: bill.categoryId,
        });
        setShowAddForm(true);
    };

    const confirmDeleteBill = (bill) => {
        setBillToDelete(bill);
        setShowDeleteModal(true);
    };

    const handleDeleteBill = async () => {
        if (billToDelete) {
            try {
                await deleteBill(billToDelete.id);
                await loadBills();
                setToastMessage('Bill deleted successfully.');
            } catch (error) {
                handleError('Error deleting bill.');
            } finally {
                setShowDeleteModal(false);
                setBillToDelete(null);
                setShowToast(true);
            }
        }
    };

    const handleError = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    return (
        <Container className="mt-3">
            <Row>
                <Col md={12} className="d-flex justify-content-end">
                    <Button variant="primary" className="my-3 me-2 btn-sm" onClick={handleShowAddForm}>
                        Add
                    </Button>
                    <Button href="http://localhost:5000/generate/report/bills" variant="outline-dark"
                            className="my-3 btn-sm">
                        Export
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    {billsLoading ? (
                        <Spinner animation="border"/>
                    ) : bills.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tenure</th>
                                <th>Amount</th>
                                <th>Category</th>
                                <th style={{width: '120px'}}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bills.map((bill) => (
                                <tr key={bill.id}>
                                    <td>{bill.id}</td>
                                    <td>{bill.tenure}</td>
                                    <td>{bill.amount}</td>
                                    <td>{categoryMap[bill.categoryId]}</td>
                                    <td>
                                        <ButtonGroup size="sm">
                                            <Button variant="outline-primary" onClick={() => handleShowEditForm(bill)}>
                                                Edit
                                            </Button>
                                            <Button variant="outline-danger" onClick={() => confirmDeleteBill(bill)}>
                                                Delete
                                            </Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert key='info' variant='info'>
                            No bills available.
                        </Alert>
                    )}
                </Col>
            </Row>

            <BillForm
                billData={billData}
                handleFormChange={handleFormChange}
                handleAddOrUpdateBill={handleAddOrUpdateBill}
                show={showAddForm}
                handleClose={handleCloseForm}
                categories={categories}
                setToastMessage={setToastMessage}
            />

            <DeleteConfirmationModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDeleteBill}
                item={billToDelete}
                itemDescription="bill"
            />

            <ToastNotification
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Bill;