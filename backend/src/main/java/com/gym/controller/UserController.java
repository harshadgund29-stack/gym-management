package com.gym.controller;

import com.gym.dto.*;
import com.gym.entity.User;
import com.gym.repository.UserRepository;
import com.gym.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * UserController — /api/users
 *
 * Public (no JWT):
 *   POST /api/users/forgot-password
 *   POST /api/users/verify-otp
 *   POST /api/users/reset-password
 *
 * Authenticated:
 *   PUT  /api/users/change-password
 *   GET  /api/users/profile
 *   PUT  /api/users/profile
 *
 * Admin only:
 *   GET  /api/users
 *   GET  /api/users/members
 *   GET  /api/users/trainers
 *   GET  /api/users/{id}
 *   DELETE /api/users/{id}
 *   PATCH  /api/users/{id}/role
 *   PATCH  /api/users/{id}/status
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;

    // ── Public password flows ─────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto request) {
        log.info("[forgot-password] Request received for email: {}", request.getEmail());
        try {
            userService.forgotPassword(request.getEmail());
            log.info("[forgot-password] OTP/email attempt completed for: {}", request.getEmail());
        } catch (Exception e) {
            // Never reveal whether email exists — but do NOT suppress logs; surface full error stacktrace
            log.error("[forgot-password] OTP/email attempt failed for: {}", request.getEmail(), e);
        }

        return ResponseEntity.ok(Map.of(
                "message", "If your email exists in our system, you will receive an OTP shortly."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @Valid @RequestBody VerifyOtpDto request) {
        log.info("[verify-otp] Attempt for email: {}", request.getEmail());
        String msg = userService.verifyOtp(request);
        log.info("[verify-otp] Result for {}: {}", request.getEmail(), msg);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordDto request) {
        log.info("[reset-password] Attempt for email: {}", request.getEmail());
        String msg = userService.resetPassword(request);
        log.info("[reset-password] Result for {}: {}", request.getEmail(), msg);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // ── Authenticated user endpoints ──────────────────────────

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<UsersResponseDto> getProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UsersResponseDto> updateProfile(
            @RequestBody UsersRequestDto requestDto,
            Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), requestDto));
    }

    // ── Admin-only endpoints ──────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsersResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsersResponseDto>> getMembers() {
        // Spec: return full DB records filtered by role MEMBER
        List<UsersResponseDto> members = userRepository.findByRoleIgnoreCase("MEMBER")
                .stream().map(this::toResponseDto).toList();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/trainers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsersResponseDto>> getTrainers() {
        // Spec: return full DB records filtered by role TRAINER
        List<UsersResponseDto> trainers = userRepository.findByRoleIgnoreCase("TRAINER")
                .stream().map(this::toResponseDto).toList();
        return ResponseEntity.ok(trainers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsersResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", userService.deleteUser(id)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsersResponseDto> updateRole(
            @PathVariable Long id,
            @RequestBody UsersRequestDto request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsersResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody UsersRequestDto request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // ── Private helper ────────────────────────────────────────

    private UsersResponseDto toResponseDto(User u) {
        UsersResponseDto dto = new UsersResponseDto();
        dto.setId(u.getId());
        dto.setName(u.getFullName().isEmpty() ? u.getEmail() : u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole() != null ? u.getRole().name() : null);
        return dto;
    }
}
