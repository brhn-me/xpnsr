import React, {useState, useEffect, useContext} from 'react';
import {Button, Container, Row, Col, Table, Spinner, ButtonGroup, Alert} from 'react-bootstrap';
import {ApiKeyContext} from '../ApiKeyProvider';
import {fetchBudgets, deleteBudget, updateBudget, addBudget} from '../api/BudgetApi';
import {fetchCategories} from '../api/CategoryApi';
import BudgetForm from '../components/BudgetForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ToastNotification from '../components/ToastNotification';
import useFetchData from '../hooks/UseFetchData';
import useCategoryMap from '../hooks/UseCategoryMap';

function Budget() {
    const {isAuthenticated} = useContext(ApiKeyContext);
    const {
        data: budgets,
        loading: budgetsLoading,
        error: budgetsError,
        reload: loadBudgets
    } = useFetchData(fetchBudgets, [isAuthenticated]);
    const {
        data: categories,
        error: categoriesError,
        reload: loadCategories
    } = useFetchData(fetchCategories, [isAuthenticated]);

    const categoryMap = useCategoryMap(categories);

    const [showAddForm, setShowAddForm] = useState(false);
    const [budgetData, setBudgetData] = useState(initialBudgetData());
    const [budgetToDelete, setBudgetToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadCategories();
            loadBudgets();
        }
    }, [isAuthenticated, loadBudgets, loadCategories]);

    useEffect(() => {
        if (budgetsError) {
            handleError('Error fetching budgets.');
        }
    }, [budgetsError]);

    useEffect(() => {
        if (categoriesError) {
            handleError('Error fetching categories.');
        }
    }, [categoriesError]);

    function initialBudgetData() {
        return {
            title: '',
            description: '',
            amount: '',
            currency: 'BDT',
            categoryId: '',
        };
    }

    const handleFormChange = (event) => {
        const {name, value} = event.target;
        setBudgetData((prevData) => ({...prevData, [name]: value}));
    };

    const handleAddOrUpdateBudget = async (event) => {
        event.preventDefault();
        try {
            if (budgetData.id) {
                await updateBudget(budgetData.id, budgetData);
                setToastMessage('Budget updated successfully.');
            } else {
                await addBudget(budgetData);
                setToastMessage('Budget added successfully.');
            }
            await loadBudgets();
            setShowAddForm(false);
        } catch (error) {
            handleError('Error adding/updating budget.');
        } finally {
            setShowToast(true);
        }
    };

    const handleCloseForm = () => setShowAddForm(false);
    const handleShowAddForm = () => {
        setBudgetData(initialBudgetData());
        setShowAddForm(true);
    };

    const handleShowEditForm = (budget) => {
        setBudgetData({
            id: budget.id,
            title: budget.title,
            description: budget.description,
            amount: budget.amount,
            currency: budget.currency,
            categoryId: budget.categoryId,
        });
        setShowAddForm(true);
    };

    const confirmDeleteBudget = (budget) => {
        setBudgetToDelete(budget);
        setShowDeleteModal(true);
    };

    const handleDeleteBudget = async () => {
        if (budgetToDelete) {
            try {
                await deleteBudget(budgetToDelete.id);
                await loadBudgets();
                setToastMessage('Budget deleted successfully.');
            } catch (error) {
                handleError('Error deleting budget.');
            } finally {
                setShowDeleteModal(false);
                setBudgetToDelete(null);
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
                    <Button href="http://localhost:5000/generate/report/budgets" variant="outline-dark"
                            className="my-3 btn-sm">
                        Export
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    {budgetsLoading ? (
                        <Spinner animation="border"/>
                    ) : budgets.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Currency</th>
                                <th>Category</th>
                                <th style={{width: '120px'}}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {budgets.map((budget) => (
                                <tr key={budget.id}>
                                    <td>{budget.id}</td>
                                    <td>{budget.title}</td>
                                    <td>{budget.description}</td>
                                    <td>{budget.amount}</td>
                                    <td>{budget.currency}</td>
                                    <td>{categoryMap[budget.categoryId]}</td>
                                    <td>
                                        <ButtonGroup size="sm">
                                            <Button variant="outline-primary" onClick={() => handleShowEditForm(budget)}>
                                                Edit
                                            </Button>
                                            <Button variant="outline-danger" onClick={() => confirmDeleteBudget(budget)}>
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
                            No budgets available.
                        </Alert>
                    )}
                </Col>
            </Row>

            <BudgetForm
                budgetData={budgetData}
                handleFormChange={handleFormChange}
                handleAddOrUpdateBudget={handleAddOrUpdateBudget}
                show={showAddForm}
                handleClose={handleCloseForm}
                categories={categories}
                setToastMessage={setToastMessage}
            />

            <DeleteConfirmationModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDeleteBudget}
                item={budgetToDelete}
                itemDescription="budget"
            />

            <ToastNotification
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Budget;