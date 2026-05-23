package com.gym.controller;

import com.gym.dto.*;
import com.gym.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * UserController — user management endpoints.
 * Base URL: /api/users
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ── Public: OTP / password-reset flow ─────────────────────────────────────

    /** POST /api/users/forgot-password — Public: generate and email OTP */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully to: " + request.getEmail());
        return ResponseEntity.ok(response);
    }

    /** POST /api/users/verify-otp — Public: check if OTP is valid */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        int otp = Integer.parseInt(request.getOtp());
        boolean isValid = userService.verifyOtp(request.getEmail(), otp);
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

    /** POST /api/users/reset-password — Public: reset password using OTP */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        int otp = Integer.parseInt(request.getOtp());
        boolean valid = userService.verifyOtp(request.getEmail(), otp);
        if (!valid) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid or expired OTP");
            return ResponseEntity.badRequest().body(response);
        }
        userService.resetPassword(request.getEmail(), request.getNewPassword());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }

    // ── Admin: user management ─────────────────────────────────────────────────

    /** GET /api/users — Admin only: list all users */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** GET /api/users/members — Admin only: list all members */
    @GetMapping("/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllMembers() {
        return ResponseEntity.ok(userService.getAllMembers());
    }

    /** GET /api/users/trainers — Admin only: list all trainers */
    @GetMapping("/trainers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllTrainers() {
        return ResponseEntity.ok(userService.getAllTrainers());
    }

    /** GET /api/users/{id} — Admin only: get user by ID */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /** DELETE /api/users/{id} — Admin only: delete a user */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ── Authenticated: own profile ─────────────────────────────────────────────

    /** GET /api/users/profile — Any authenticated user: get own profile */
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    /** PUT /api/users/profile — Any authenticated user: update own profile */
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                  Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    /**
     * PUT /api/users/change-password — Any authenticated user: change own password.
     * Uses ChangePasswordRequest: { currentPassword, newPassword }
     */
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                Principal principal) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
