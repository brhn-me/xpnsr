package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Abstract base class for custom error exceptions.
 */
public abstract class BaseError extends RuntimeException {
    private final HttpStatus status;

    /**
     * Constructor to initialize BaseError with a custom error message and HTTP status.
     * @param message The error message to be returned.
     * @param status The HTTP status associated with the error.
     */
    public BaseError(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    /**
     * Retrieves the HTTP status associated with the error.
     * @return The HTTP status.
     */
    public HttpStatus getStatus() {
        return status;
    }
}
