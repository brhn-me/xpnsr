package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UserExistsError extends BaseError {
    public UserExistsError(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
