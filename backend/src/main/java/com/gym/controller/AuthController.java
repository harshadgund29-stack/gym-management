package com.gym.controller;

import com.gym.dto.AuthResponse;
import com.gym.dto.LoginRequest;
import com.gym.dto.RegisterRequest;
import com.gym.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
     * Register a new user and return a JWT token.
     *
     * Request body: { firstName, lastName, email, password, role, phone, address }
     * Response: { token, userId, firstName, lastName, email, role }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * POST /api/auth/login
     * Authenticate a user and return a JWT token.
     *
     * Request body: { email, password }
     * Response: { token, userId, firstName, lastName, email, role }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
