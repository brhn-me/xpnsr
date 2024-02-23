package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundError extends BaseError {
    public NotFoundError(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
