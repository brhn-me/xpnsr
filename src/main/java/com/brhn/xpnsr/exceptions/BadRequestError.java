package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception representing a Bad Request error (HTTP 400).
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestError extends BaseError {

    /**
     * Constructor to initialize BadRequestError with a custom error message.
     * @param message The error message to be returned.
     */
    public BadRequestError(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
