import {Col, Form, Row} from "react-bootstrap";
import React from "react";

export const FormGroup = ({controlId, label, type, name, placeholder, value, handleChange, error}) => (
    <Form.Group as={Row} className="mb-3" controlId={controlId}>
        <Form.Label column sm={4}>{label}</Form.Label>
        <Col sm={8}>
            <Form.Control
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                isInvalid={!!error}
                required
            />
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Col>
    </Form.Group>
);