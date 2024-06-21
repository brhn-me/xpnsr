import React, {useState} from 'react';
import {Form, Col, Row} from 'react-bootstrap';

const CategorySelector = ({categories, selectedCategoryId, onCategoryChange, errors}) => {
    const [categoryType, setCategoryType] = useState('');

    const handleCategoryTypeChange = (event) => {
        setCategoryType(event.target.value);
        onCategoryChange(''); // Reset category selection when type changes
    };

    const handleCategoryChange = (event) => {
        onCategoryChange(event.target.value);
    };

    const filteredCategories = categories.filter(category => category.type === categoryType);

    return (
        <>
            <Form.Group as={Row} className="mb-3">
                <Form.Label as="legend" column sm={4}>Type</Form.Label>
                <Col sm={8}>
                    <Form.Check
                        type="radio"
                        label="Earning"
                        name="categoryType"
                        value="EARNING"
                        checked={categoryType === 'EARNING'}
                        onChange={handleCategoryTypeChange}
                        inline
                    />
                    <Form.Check
                        type="radio"
                        label="Expense"
                        name="categoryType"
                        value="EXPENSE"
                        checked={categoryType === 'EXPENSE'}
                        onChange={handleCategoryTypeChange}
                        inline
                    />
                </Col>
            </Form.Group>
            {categoryType && (
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
                            {filteredCategories.map((category) => (
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
            )}
        </>
    );
};

export default CategorySelector;
