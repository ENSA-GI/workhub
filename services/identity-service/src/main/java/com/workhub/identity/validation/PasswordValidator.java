package com.workhub.identity.validation;

public final class PasswordValidator {

    private static final int MIN_LENGTH = 12;
    private static final String COMPLEXITY_PATTERN =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).+$";

    private PasswordValidator() {}

    public static void validate(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("Password must be at least 12 characters");
        }
        if (!password.matches(COMPLEXITY_PATTERN)) {
            throw new IllegalArgumentException(
                    "Password must contain uppercase, lowercase, digit and special character");
        }
    }
}
