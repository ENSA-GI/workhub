package com.workhub.identity.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason() != null ? ex.getReason() : "Error"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeExceptions(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (msg.contains("invalid credentials")
                || msg.contains("user not found")
                || msg.contains("invalid mfa")
                || msg.contains("invalid refresh")
                || msg.contains("account locked")
                || msg.contains("account deactivated")
                || msg.contains("email not verified")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        if (msg.contains("invalid activation") || msg.contains("invalid reset") || msg.contains("expired")) {
            return ResponseEntity.badRequest().body(error);
        }
        return ResponseEntity.internalServerError().body(error);
    }
}
