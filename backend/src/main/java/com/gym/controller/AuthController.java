package com.gym.controller;

import com.gym.dto.AuthResponse;
import com.gym.dto.LoginRequest;
import com.gym.dto.RegisterRequest;
import com.gym.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController — public endpoints for login, registration,
 * forgot password and reset password.
 *
 * Base URL: /api/auth
 * All endpoints are permitted without JWT (see SecurityConfig).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ── Register ──────────────────────────────────────────────

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // ── Login ─────────────────────────────────────────────────

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // ── Forgot Password ───────────────────────────────────────

    /**
     * POST /api/auth/forgot-password
     *
     * Accepts BOTH formats so frontend and Postman both work:
     *
     *   Format A — query param (original):
     *     POST /api/auth/forgot-password?email=user@example.com
     *
     *   Format B — JSON body (preferred, avoids URL encoding issues):
     *     POST /api/auth/forgot-password
     *     { "email": "user@example.com" }
     *
     * Always returns 200 regardless of whether the email exists
     * (prevents email enumeration attacks).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            // Optional query param
            @RequestParam(required = false) String email,
            // Optional JSON body
            @RequestBody(required = false) Map<String, String> body) {

        // Resolve email from whichever format was used
        String resolvedEmail = (email != null && !email.isBlank())
                ? email
                : (body != null ? body.get("email") : null);

        if (resolvedEmail == null || resolvedEmail.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required."));
        }

        authService.forgotPassword(resolvedEmail);
        return ResponseEntity.ok(Map.of(
                "message", "If that email is registered, a reset link has been sent."));
    }

    // ── Reset Password ────────────────────────────────────────

    /**
     * POST /api/auth/reset-password
     * Body: { "token": "...", "newPassword": "..." }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password reset successful."));
    }
}
