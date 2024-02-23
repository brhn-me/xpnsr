package com.brhn.xpnsr.exceptions;

class ErrorResponse {
    private final int code;
    private final String error;

    public ErrorResponse(int code, String message) {
        this.code = code;
        this.error = message;
    }

    public int getCode() {
        return code;
    }

    public String getError() {
        return error;
    }
}
