import React, {useState} from 'react';
import {Alert, Button, Form, Modal} from 'react-bootstrap';
import {FormGroup} from './FormGroup';
import ExpenseCategorySelector from "./ExpenseCategorySelector";

const BudgetForm = ({
                        budgetData,
                        handleFormChange,
                        handleAddOrUpdateBudget,
                        show,
                        handleClose,
                        categories,
                        setToastMessage
                    }) => {
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const {title, amount, currency, categoryId} = budgetData;
        const newErrors = {};

        if (!title || title.length < 1 || title.length > 100) {
            newErrors.title = 'Title must be between 1 and 100 characters';
        }
        if (!amount || amount < 0) {
            newErrors.amount = 'Amount must be greater than or equal to 0';
        }
        if (!currency || currency.length < 1 || currency.length > 10) {
            newErrors.currency = 'Currency must be between 1 and 10 characters';
        }
        if (!categoryId) {
            newErrors.categoryId = 'Category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            handleAddOrUpdateBudget(event);
            setToastMessage(budgetData.id ? 'Budget updated successfully' : 'Budget added successfully');
            handleClose(); // Close the modal if form is valid
        }
    };

    const handleCategoryChange = (categoryId) => {
        handleFormChange({target: {name: 'categoryId', value: categoryId}});
    };

    const currencyOptions = [
        {value: 'EUR', label: 'EUR'},
        {value: 'USD', label: 'USD'},
        {value: 'BDT', label: 'BDT'},
        {value: 'GBP', label: 'GBP'},
        {value: 'INR', label: 'INR'}
    ];

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{budgetData.id ? 'Update' : 'New'} Budget</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {Object.keys(errors).length > 0 && (
                    <Alert variant="danger">
                        {Object.values(errors).map((error, idx) => (
                            <div key={idx}>{error}</div>
                        ))}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <FormGroup
                        controlId="formTitle"
                        label="Title"
                        type="text"
                        name="title"
                        placeholder="Budget for electronics"
                        value={budgetData.title}
                        handleChange={handleFormChange}
                        error={errors.title}
                    />
                    <FormGroup
                        controlId="formDescription"
                        label="Description"
                        type="text"
                        name="description"
                        placeholder="mobile, laptop"
                        value={budgetData.description}
                        handleChange={handleFormChange}
                        error={errors.description}
                    />
                    <FormGroup
                        controlId="formAmount"
                        label="Amount"
                        type="number"
                        name="amount"
                        placeholder="100"
                        value={budgetData.amount}
                        handleChange={handleFormChange}
                        error={errors.amount}
                    />
                    <FormGroup
                        controlId="formCurrency"
                        label="Currency"
                        type="select"
                        name="currency"
                        value={budgetData.currency}
                        handleChange={handleFormChange}
                        error={errors.currency}
                        options={currencyOptions}
                    />
                    <ExpenseCategorySelector
                        categories={categories}
                        selectedCategoryId={budgetData.categoryId}
                        onCategoryChange={handleCategoryChange}
                        errors={errors}
                    />
                    <Button variant="success" type="submit">
                        {budgetData.id ? 'Save' : 'Add'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default BudgetForm;
