package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for handling exceptions across all controllers.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles MethodArgumentNotValidException, which occurs when validation on an argument fails.
     *
     * @param ex The exception object.
     * @return ResponseEntity containing the ErrorResponse and HttpStatus.BAD_REQUEST.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Invalid input values", errors);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles exceptions of type BaseError.
     *
     * @param ex      The exception object.
     * @param request The current web request.
     * @return ResponseEntity containing the ErrorResponse and appropriate HTTP status.
     */
    @ExceptionHandler(BaseError.class)
    public ResponseEntity<ErrorResponse> handleBaseApiExceptions(BaseError ex, WebRequest request) {
        ErrorResponse er = new ErrorResponse(ex.getStatus().value(), ex.getMessage());
        return new ResponseEntity<>(er, ex.getStatus());
    }

    /**
     * Handles HttpMessageNotReadableException that occurs when the request JSON is malformed.
     *
     * @param ex      The exception object.
     * @param request The current web request.
     * @return ResponseEntity containing the ErrorResponse and HttpStatus.BAD_REQUEST.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, WebRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ErrorResponse er = new ErrorResponse(status.value(), ex.getMessage());
        return new ResponseEntity<>(er, status);
    }

    /**
     * Handles RuntimeExceptions that might occur during application execution.
     *
     * @param ex      The exception object.
     * @param request The current web request.
     * @return ResponseEntity containing the ErrorResponse and HttpStatus.INTERNAL_SERVER_ERROR.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRunTimeExceptions(RuntimeException ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse er = new ErrorResponse(status.value(), ex.getMessage());
        return new ResponseEntity<>(er, status);
    }

    /**
     * Handles generic Exception type, covering all other unhandled exceptions.
     *
     * @param ex      The exception object.
     * @param request The current web request.
     * @return ResponseEntity containing the ErrorResponse and HttpStatus.INTERNAL_SERVER_ERROR.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleException(Exception ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse er = new ErrorResponse(status.value(), ex.getMessage());
        return new ResponseEntity<>(er, status);
    }
}
