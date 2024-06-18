package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for user already exists errors.
 * Extends BaseError to provide a custom error message and HTTP status.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class UserExistsError extends BaseError {

    /**
     * Constructor to initialize UserExistsError with a message.
     * @param message The error message.
     */
    public UserExistsError(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
