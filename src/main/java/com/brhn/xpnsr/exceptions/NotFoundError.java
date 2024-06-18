package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for resource not found errors.
 * Extends BaseError to provide a custom error message and HTTP status.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundError extends BaseError {

    /**
     * Constructor to initialize NotFoundError with a message.
     * @param message The error message.
     */
    public NotFoundError(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
