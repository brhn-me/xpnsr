import React, {useState} from 'react';
import {Alert, Button, Form, Modal} from 'react-bootstrap';
import {FormGroup} from './FormGroup';
import ExpenseCategorySelector from "./ExpenseCategorySelector";

const TransactionForm = ({
                             transactionData,
                             handleFormChange,
                             handleAddOrUpdateTransaction,
                             show,
                             handleClose,
                             categories,
                             setToastMessage
                         }) => {
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const {date, type, amount, currency, primaryCategoryId} = transactionData;
        const newErrors = {};

        if (!date) {
            newErrors.date = 'Date is required';
        }
        if (!type) {
            newErrors.type = 'Transaction type is required';
        }
        if (!amount || amount < 0) {
            newErrors.amount = 'Amount must be greater than or equal to 0';
        }
        if (!currency || currency.length < 1 || currency.length > 10) {
            newErrors.currency = 'Currency must be between 1 and 10 characters';
        }
        if (!primaryCategoryId) {
            newErrors.primaryCategoryId = 'Primary category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            handleAddOrUpdateTransaction(event);
            setToastMessage(transactionData.id ? 'Transaction updated successfully' : 'Transaction added successfully');
            handleClose(); // Close the modal if form is valid
        }
    };

    const handleCategoryChange = (categoryId, isPrimary) => {
        handleFormChange({target: {name: isPrimary ? 'primaryCategoryId' : 'secondaryCategoryId', value: categoryId}});
    };

    const currencyOptions = [
        {value: 'BDT', label: 'BDT'},
        {value: 'USD', label: 'USD'},
        {value: 'EUR', label: 'EUR'},
        {value: 'GBP', label: 'GBP'},
        {value: 'INR', label: 'INR'}
    ];

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{transactionData.id ? 'Update' : 'New'} Transaction</Modal.Title>
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
                        controlId="formDate"
                        label="Date"
                        type="datetime-local"
                        name="date"
                        value={transactionData.date}
                        handleChange={handleFormChange}
                        error={errors.date}
                    />
                    <FormGroup
                        controlId="formType"
                        label="Type"
                        type="text"
                        name="type"
                        placeholder="Type"
                        value={transactionData.type}
                        handleChange={handleFormChange}
                        error={errors.type}
                    />
                    <FormGroup
                        controlId="formAmount"
                        label="Amount"
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={transactionData.amount}
                        handleChange={handleFormChange}
                        error={errors.amount}
                    />
                    <FormGroup
                        controlId="formDue"
                        label="Due"
                        type="number"
                        name="due"
                        placeholder="Due"
                        value={transactionData.due}
                        handleChange={handleFormChange}
                        error={errors.due}
                    />
                    <FormGroup
                        controlId="formTitle"
                        label="Title"
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={transactionData.title}
                        handleChange={handleFormChange}
                        error={errors.title}
                    />
                    <FormGroup
                        controlId="formCurrency"
                        label="Currency"
                        type="select"
                        name="currency"
                        value={transactionData.currency}
                        handleChange={handleFormChange}
                        error={errors.currency}
                        options={currencyOptions}
                    />
                    <FormGroup
                        controlId="formCity"
                        label="City"
                        type="text"
                        name="city"
                        placeholder="City"
                        value={transactionData.city}
                        handleChange={handleFormChange}
                        error={errors.city}
                    />
                    <FormGroup
                        controlId="formCountry"
                        label="Country"
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={transactionData.country}
                        handleChange={handleFormChange}
                        error={errors.country}
                    />
                    <FormGroup
                        controlId="formDescription"
                        label="Description"
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={transactionData.description}
                        handleChange={handleFormChange}
                        error={errors.description}
                    />
                    <FormGroup
                        controlId="formTags"
                        label="Tags"
                        type="text"
                        name="tags"
                        placeholder="Tags"
                        value={transactionData.tags}
                        handleChange={handleFormChange}
                        error={errors.tags}
                    />
                    <ExpenseCategorySelector
                        categories={categories}
                        selectedCategoryId={transactionData.primaryCategoryId}
                        onCategoryChange={(categoryId) => handleCategoryChange(categoryId, true)}
                        errors={errors}
                    />
                    <ExpenseCategorySelector
                        categories={categories}
                        selectedCategoryId={transactionData.secondaryCategoryId}
                        onCategoryChange={(categoryId) => handleCategoryChange(categoryId, false)}
                        errors={errors}
                    />
                    <Button variant="success" type="submit">
                        {transactionData.id ? 'Save' : 'Add'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default TransactionForm;
