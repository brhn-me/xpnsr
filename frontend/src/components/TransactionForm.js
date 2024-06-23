import React, {useState, useEffect} from 'react';
import {Alert, Button, Form, Modal, Col, Row, Collapse} from 'react-bootstrap';
import {FormGroup} from './FormGroup';

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
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Reset primary and secondary categories if the type changes
        handleFormChange({target: {name: 'primaryCategoryId', value: ''}});
        handleFormChange({target: {name: 'secondaryCategoryId', value: null}});
    }, [transactionData.type]);

    useEffect(() => {
        if (!show) {
            setErrors({});
            setOpen(false);
        }
    }, [show]);

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
        handleFormChange({
            target: {
                name: isPrimary ? 'primaryCategoryId' : 'secondaryCategoryId',
                value: categoryId ? categoryId : null
            }
        });
    };

    const handleTypeChange = (event) => {
        handleFormChange(event);
    };

    const filteredCategories = transactionData.type === 'EARNING'
        ? categories.filter(category => category.type === 'EARNING')
        : categories.filter(category => category.type === 'EXPENSE');

    const currencyOptions = [
        {value: 'BDT', label: 'BDT'},
        {value: 'USD', label: 'USD'},
        {value: 'EUR', label: 'EUR'},
        {value: 'GBP', label: 'GBP'},
        {value: 'INR', label: 'INR'}
    ];

    const transactionTypeOptions = [
        {value: '', label: 'Select Type'},
        {value: 'EARNING', label: 'Earning'},
        {value: 'EXPENSE', label: 'Expense'}
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
                        type="date"
                        name="date"
                        value={transactionData.date}
                        handleChange={handleFormChange}
                        error={errors.date}
                        required
                    />
                    <FormGroup
                        controlId="formType"
                        label="Type"
                        type="select"
                        name="type"
                        value={transactionData.type}
                        handleChange={handleTypeChange}
                        error={errors.type}
                        required
                        options={transactionTypeOptions}
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
                        required
                    />
                    <Form.Group as={Row} className="mb-3" controlId="formPrimaryCategoryId">
                        <Form.Label column sm={4}>Primary Category</Form.Label>
                        <Col sm={8}>
                            <Form.Control
                                as="select"
                                name="primaryCategoryId"
                                value={transactionData.primaryCategoryId}
                                onChange={(e) => handleCategoryChange(e.target.value, true)}
                                isInvalid={!!errors.primaryCategoryId}
                                required
                            >
                                <option value="">Select Category</option>
                                {filteredCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {errors.primaryCategoryId}
                            </Form.Control.Feedback>
                        </Col>
                    </Form.Group>
                    <FormGroup
                        controlId="formCurrency"
                        label="Currency"
                        type="select"
                        name="currency"
                        value={transactionData.currency}
                        handleChange={handleFormChange}
                        error={errors.currency}
                        required
                        options={currencyOptions}
                    />
                    <Collapse in={open}>
                        <div id="collapse-form">
                            <FormGroup
                                controlId="formDue"
                                label="Due"
                                type="number"
                                name="due"
                                placeholder="Due"
                                value={transactionData.due}
                                handleChange={handleFormChange}
                                error={errors.due}
                                required={false}
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
                                required={false}
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
                                required={false}
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
                                required={false}
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
                                required={false}
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
                                required={false}
                            />
                            <Form.Group as={Row} className="mb-3" controlId="formSecondaryCategoryId">
                                <Form.Label column sm={4}>Secondary Category</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        as="select"
                                        name="secondaryCategoryId"
                                        value={transactionData.secondaryCategoryId || ''}
                                        onChange={(e) => handleCategoryChange(e.target.value, false)}
                                        isInvalid={!!errors.secondaryCategoryId}
                                        required={false}
                                    >
                                        <option value="">Select Category</option>
                                        {filteredCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.secondaryCategoryId}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        </div>
                    </Collapse>
                    <div>
                        <Button variant="success" type="submit">
                            {transactionData.id ? 'Save' : 'Add'}
                        </Button>
                        <Button
                            onClick={() => setOpen(!open)}
                            aria-controls="collapse-form"
                            aria-expanded={open}
                            variant="outline-dark"
                            style={{marginLeft: '0.5rem'}}
                        >
                            {open ? 'Less' : 'More'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default TransactionForm;
