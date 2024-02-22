package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;

public abstract class BaseApiError extends RuntimeException {
    public BaseApiError(String message) {
        super(message);
    }

    public abstract HttpStatus getStatus();
}
