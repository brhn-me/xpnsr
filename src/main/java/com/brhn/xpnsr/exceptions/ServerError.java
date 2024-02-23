package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ServerError extends BaseError {
    public ServerError(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
