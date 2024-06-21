import {Col, Form, Row} from "react-bootstrap";
import React from "react";

export const FormGroup = ({controlId, label, type, name, placeholder, value, handleChange, error, options}) => (
    <Form.Group as={Row} className="mb-3" controlId={controlId}>
        <Form.Label column sm={4}>{label}</Form.Label>
        <Col sm={8}>
            {type === 'select' ? (
                <Form.Control
                    as="select"
                    name={name}
                    value={value}
                    onChange={handleChange}
                    isInvalid={!!error}
                    required
                >
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Form.Control>
            ) : (
                <Form.Control
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    isInvalid={!!error}
                    required
                />
            )}
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Col>
    </Form.Group>
);
