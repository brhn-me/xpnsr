package com.brhn.xpnsr.exceptions;

/**
 * Class representing an error response structure.
 */
class ErrorResponse {
    private final int code;
    private final String error;

    /**
     * Constructs an ErrorResponse object with a code and an error message.
     * @param code The error code.
     * @param message The error message.
     */
    public ErrorResponse(int code, String message) {
        this.code = code;
        this.error = message;
    }

    /**
     * Retrieves the error code.
     * @return The error code.
     */
    public int getCode() {
        return code;
    }

    /**
     * Retrieves the error message.
     * @return The error message.
     */
    public String getError() {
        return error;
    }
}
