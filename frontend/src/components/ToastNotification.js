import React from 'react';
import { Toast } from 'react-bootstrap';

const ToastNotification = ({ show, onClose, message }) => (
    <Toast
        onClose={onClose}
        show={show}
        delay={3000}
        autohide
        bg="dark"
        style={{ position: 'absolute', bottom: 20, left: 20, minWidth: '200px' }}
    >
        <Toast.Body className="text-white">{message}</Toast.Body>
    </Toast>
);

export default ToastNotification;