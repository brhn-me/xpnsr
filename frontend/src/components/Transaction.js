import React, {useState, useEffect, useContext} from 'react';
import {Button, Container, Row, Col, Table, Spinner, ButtonGroup, Alert} from 'react-bootstrap';
import {ApiKeyContext} from '../ApiKeyProvider';
import {
    fetchTransactions,
    deleteTransaction,
    updateTransaction,
    addTransaction,
    updateTransactionHM, deleteTransactionHM
} from '../api/TransactionApi';
import {fetchCategories} from '../api/CategoryApi';
import TransactionForm from '../components/TransactionForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ToastNotification from '../components/ToastNotification';
import useFetchData from '../hooks/UseFetchData';
import useCategoryMap from '../hooks/UseCategoryMap';
import {format} from 'date-fns';
import {getHyperMediaLink} from "../api/HyperMedia";


function Transaction() {
    const {isAuthenticated} = useContext(ApiKeyContext);
    const {
        data: transactions,
        loading: transactionsLoading,
        error: transactionsError,
        reload: loadTransactions
    } = useFetchData(fetchTransactions, [isAuthenticated]);
    const {
        data: categories,
        error: categoriesError,
        reload: loadCategories
    } = useFetchData(fetchCategories, [isAuthenticated]);

    const categoryMap = useCategoryMap(categories);

    const [showAddForm, setShowAddForm] = useState(false);
    const [transactionData, setTransactionData] = useState(initialTransactionData());
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadCategories();
            loadTransactions();
        }
    }, [isAuthenticated, loadTransactions, loadCategories]);

    useEffect(() => {
        if (transactionsError) {
            handleError('Error fetching transactions.');
        }
    }, [transactionsError]);

    useEffect(() => {
        if (categoriesError) {
            handleError('Error fetching categories.');
        }
    }, [categoriesError]);

    function initialTransactionData() {
        return {
            date: '',
            type: '',
            amount: '',
            title: '',
            currency: 'BDT',
            description: '',
            tags: '',
            primaryCategoryId: ''
        };
    }

    const handleFormChange = (event) => {
        const {name, value} = event.target;
        setTransactionData((prevData) => ({...prevData, [name]: value}));
    };

    const handleAddOrUpdateTransaction = async (event) => {
        event.preventDefault();
        try {
            if (transactionData.id) {
                const hmEditLink = getHyperMediaLink('edit', transactionData);
                if (hmEditLink) {
                    await updateTransactionHM(hmEditLink, transactionData);
                } else {
                    await updateTransaction(transactionData.id, transactionData);
                }
                setToastMessage('Transaction updated successfully.');
            } else {
                await addTransaction(transactionData);
                setToastMessage('Transaction added successfully.');
            }
            await loadTransactions();
            setShowAddForm(false);
        } catch (error) {
            if (transactionData.id) {
                handleError('Error updating transaction.');
            } else {
                handleError('Error adding transaction.');
            }
        } finally {
            setShowToast(true);
        }
    };

    const handleCloseForm = () => setShowAddForm(false);
    const handleShowAddForm = () => {
        setTransactionData(initialTransactionData());
        setShowAddForm(true);
    };

    const handleShowEditForm = (transaction) => {
        setTransactionData({
            id: transaction.id,
            date: transaction.date,
            type: transaction.type,
            amount: transaction.amount,
            title: transaction.title,
            currency: transaction.currency,
            description: transaction.description,
            tags: transaction.tags,
            primaryCategoryId: transaction.primaryCategoryId
        });
        setShowAddForm(true);
    };

    const confirmDeleteTransaction = (transaction) => {
        setTransactionToDelete(transaction);
        setShowDeleteModal(true);
    };

    const handleDeleteTransaction = async () => {
        if (transactionToDelete) {
            try {
                const hmDeleteLink = getHyperMediaLink('delete', transactionToDelete);
                if (hmDeleteLink) {
                    await deleteTransactionHM(hmDeleteLink);
                } else {
                    await deleteTransaction(transactionToDelete.id);
                }
                await loadTransactions();
                setToastMessage('Transaction deleted successfully.');
            } catch (error) {
                handleError('Error deleting transaction.');
            } finally {
                setShowDeleteModal(false);
                setTransactionToDelete(null);
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
                    <Button href="http://localhost:5000/generate/report/transactions" variant="outline-dark"
                            className="my-3 btn-sm">
                        Export
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    {transactionsLoading ? (
                        <Spinner animation="border"/>
                    ) : transactions.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Title</th>
                                <th>Currency</th>
                                <th>Description</th>
                                <th>Tags</th>
                                <th>Primary Category</th>
                                <th style={{width: '120px'}}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{transaction.id}</td>
                                    <td>{format(new Date(transaction.date), 'yyyy-MM-dd HH:mm')}</td>
                                    <td>{transaction.type}</td>
                                    <td>{transaction.amount}</td>
                                    <td>{transaction.title}</td>
                                    <td>{transaction.currency}</td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.tags}</td>
                                    <td>{categoryMap[transaction.primaryCategoryId]}</td>
                                    <td>
                                        <ButtonGroup size="sm">
                                            <Button variant="outline-primary"
                                                    onClick={() => handleShowEditForm(transaction)}>
                                                Edit
                                            </Button>
                                            <Button variant="outline-danger"
                                                    onClick={() => confirmDeleteTransaction(transaction)}>
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
                            No transactions available.
                        </Alert>
                    )}
                </Col>
            </Row>

            <TransactionForm
                transactionData={transactionData}
                handleFormChange={handleFormChange}
                handleAddOrUpdateTransaction={handleAddOrUpdateTransaction}
                show={showAddForm}
                handleClose={handleCloseForm}
                categories={categories}
                setToastMessage={setToastMessage}
            />

            <DeleteConfirmationModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDeleteTransaction}
                item={transactionToDelete}
                itemDescription="transaction"
            />

            <ToastNotification
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Transaction;
