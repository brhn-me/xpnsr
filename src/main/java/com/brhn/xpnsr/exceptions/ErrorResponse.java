package com.brhn.xpnsr.exceptions;

import java.util.Map;

/**
 * Class representing an error response structure.
 */
public class ErrorResponse {
    private final int code;
    private final String error;
    private final Map<String, String> errorFields;

    /**
     * Constructs an ErrorResponse object with a code, an error message, and error fields.
     *
     * @param code        The error code.
     * @param error       The error message.
     * @param errorFields The field-specific error messages.
     */
    public ErrorResponse(int code, String error, Map<String, String> errorFields) {
        this.code = code;
        this.error = error;
        this.errorFields = errorFields;
    }

    /**
     * Constructs an ErrorResponse object with a code and an error message.
     *
     * @param code  The error code.
     * @param error The error message.
     */
    public ErrorResponse(int code, String error) {
        this(code, error, null);
    }

    /**
     * Retrieves the error code.
     *
     * @return The error code.
     */
    public int getCode() {
        return code;
    }

    /**
     * Retrieves the error message.
     *
     * @return The error message.
     */
    public String getError() {
        return error;
    }

    /**
     * Retrieves the field-specific error messages.
     *
     * @return The field-specific error messages.
     */
    public Map<String, String> getErrorFields() {
        return errorFields;
    }
}
