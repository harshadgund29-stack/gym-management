package com.gym.controller;

import com.gym.dto.UserDTO;
import com.gym.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * MembersController — member list for trainers/admins.
 * Base URL: /api/members
 */
@RestController
@RequestMapping("/api/members")
public class MembersController {

    @Autowired
    private UserService userService;

    /** GET /api/members/list — All gym members */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<UserDTO>> listMembers() {
        return ResponseEntity.ok(userService.getAllMembers());
    }
}
