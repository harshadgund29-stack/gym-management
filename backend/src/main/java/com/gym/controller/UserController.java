package com.gym.controller;

import com.gym.dto.ChangePasswordRequest;
import com.gym.dto.UpdateProfileRequest;
import com.gym.dto.UserDTO;
import com.gym.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * UserController — user management endpoints.
 * Base URL: /api/users
 *
 * Principal is injected by Spring Security — it holds the logged-in user's email.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

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

    /** GET /api/users/profile — Any authenticated user: get own profile */
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Principal principal) {
        // principal.getName() returns the logged-in user's email
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    /** PUT /api/users/profile — Any authenticated user: update own profile */
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                  Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    /** DELETE /api/users/{id} — Admin only: delete a user */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /** PUT /api/users/change-password — Any authenticated user: change own password */
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                Principal principal) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
