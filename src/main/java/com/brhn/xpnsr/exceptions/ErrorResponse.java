package com.brhn.xpnsr.exceptions;

class ErrorResponse {
    private int code;
    private String message;

    public ErrorResponse(int error_code, String message) {
        this.code = error_code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
