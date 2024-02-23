package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseError.class)
    public ResponseEntity<ErrorResponse> handleBaseApiExceptions(BaseError ex, WebRequest request) {
        ErrorResponse er = new ErrorResponse(ex.getStatus().value(), ex.getMessage());
        return new ResponseEntity<>(er, ex.getStatus());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRunTimeExceptions(RuntimeException ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse er = new ErrorResponse(status.value(), ex.getMessage());
        return new ResponseEntity<>(er, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleException(Exception ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse er = new ErrorResponse(status.value(), ex.getMessage());
        return new ResponseEntity<>(er, status);
    }
}

