package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestError extends BaseError {
    public BadRequestError(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
