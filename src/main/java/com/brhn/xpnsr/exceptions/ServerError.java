package com.brhn.xpnsr.exceptions;

import org.springframework.http.HttpStatus;

public class ServerError extends BaseApiError {
    public ServerError(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
