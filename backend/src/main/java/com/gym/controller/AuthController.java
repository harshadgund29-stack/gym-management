package com.gym.controller;

import com.gym.dto.AuthResponse;
import com.gym.dto.LoginRequest;
import com.gym.dto.RegisterRequest;
import com.gym.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthController — public endpoints for login and registration.
 * No JWT required to access these endpoints (configured in SecurityConfig).
 *
 * Base URL: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/register
     * Register a new user and return a JWT token + role.
     *
     * Request body: { firstName, lastName, email, password, role, phone, address }
     * Response: { token, userId, firstName, lastName, email, role }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Authenticate a user and return a JWT token + role.
     *
     * Request body: { email, password }
     * Response: { token, userId, firstName, lastName, email, role }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);

        // ✅ Add role-based info for frontend redirection
        Map<String, Object> enrichedResponse = new HashMap<>();
        enrichedResponse.put("token", response.getToken());
        enrichedResponse.put("userId", response.getUserId());
        enrichedResponse.put("firstName", response.getFirstName());
        enrichedResponse.put("lastName", response.getLastName());
        enrichedResponse.put("email", response.getEmail());
        enrichedResponse.put("role", response.getRole());

        return ResponseEntity.ok(response);
    }

    /** POST /api/auth/forgot-password — Generates and emails an OTP */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully to: " + email);
        return ResponseEntity.ok(response);
    }

    /** POST /api/auth/verify-otp — Checks if OTP is valid */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean isValid = authService.verifyOtp(email, otp);
        Map<String, Object> response = new HashMap<>();
        if (isValid) {
            response.put("message", "OTP verified successfully");
            response.put("verified", true);
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid or expired OTP");
            response.put("verified", false);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /** POST /api/auth/reset-password — Resets password using valid OTP */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody com.gym.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }
}
