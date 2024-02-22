package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;

public class NotFoundError extends BaseApiError {
    public NotFoundError(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.NOT_FOUND;
    }
}
