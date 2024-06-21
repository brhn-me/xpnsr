import React, {useState} from 'react';
import {Modal, Form, Button, Row, Col, Alert} from 'react-bootstrap';
import {FormGroup} from './FormGroup';
import CategorySelector from './CategorySelector';
import ExpenseCategorySelector from "./ExpenseCategorySelector";

const BillForm = ({
                      billData,
                      handleFormChange,
                      handleAddOrUpdateBill,
                      show,
                      handleClose,
                      categories,
                      setToastMessage
                  }) => {
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const {tenure, amount, categoryId} = billData;
        const newErrors = {};

        if (!tenure || tenure < 0) {
            newErrors.tenure = 'Tenure must be a positive integer';
        }
        if (!amount || amount < 0) {
            newErrors.amount = 'Amount must be greater than or equal to 0';
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
            handleAddOrUpdateBill(event);
            setToastMessage(billData.id ? 'Bill updated successfully' : 'Bill added successfully');
            handleClose(); // Close the modal if form is valid
        }
    };

    const handleCategoryChange = (categoryId) => {
        handleFormChange({target: {name: 'categoryId', value: categoryId}});
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{billData.id ? 'Update' : 'New'} Bill</Modal.Title>
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
                        controlId="formTenure"
                        label="Tenure"
                        type="number"
                        name="tenure"
                        placeholder="6"
                        value={billData.tenure}
                        handleChange={handleFormChange}
                        error={errors.tenure}
                    />
                    <FormGroup
                        controlId="formAmount"
                        label="Amount"
                        type="number"
                        name="amount"
                        placeholder="100"
                        value={billData.amount}
                        handleChange={handleFormChange}
                        error={errors.amount}
                    />
                    <ExpenseCategorySelector
                        categories={categories}
                        selectedCategoryId={billData.categoryId}
                        onCategoryChange={handleCategoryChange}
                        errors={errors}
                    />
                    <Button variant="success" type="submit">
                        {billData.id ? 'Save' : 'Add'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default BillForm;
