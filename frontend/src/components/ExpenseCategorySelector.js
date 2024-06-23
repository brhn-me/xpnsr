import React from 'react';
import {Form, Col, Row} from 'react-bootstrap';

const ExpenseCategorySelector = ({categories, selectedCategoryId, onCategoryChange, errors}) => {
    const handleCategoryChange = (event) => {
        onCategoryChange(event.target.value);
    };

    const expenseCategories = categories.filter(category => category.type === 'EXPENSE');

    return (
        <Form.Group as={Row} className="mb-3" controlId="formCategoryId">
            <Form.Label column sm={4}>Category</Form.Label>
            <Col sm={8}>
                <Form.Control
                    as="select"
                    name="categoryId"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    isInvalid={!!errors.categoryId}
                    required
                >
                    <option value="">Select Category</option>
                    {expenseCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                    {errors.categoryId}
                </Form.Control.Feedback>
            </Col>
        </Form.Group>
    );
};

export default ExpenseCategorySelector;
