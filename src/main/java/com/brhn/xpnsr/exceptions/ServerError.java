package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for server errors.
 * Extends BaseError to provide a custom error message and HTTP status.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ServerError extends BaseError {

    /**
     * Constructor to initialize ServerError with a message.
     * @param message The error message.
     */
    public ServerError(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
