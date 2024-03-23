package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;

public abstract class BaseError extends RuntimeException {
    private final HttpStatus status;

    public BaseError(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
