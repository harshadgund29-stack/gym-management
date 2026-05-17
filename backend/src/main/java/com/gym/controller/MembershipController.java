package com.gym.controller;

import com.gym.dto.CreateMembershipRequest;
import com.gym.dto.MembershipDTO;
import com.gym.entity.Membership;
import com.gym.service.MembershipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MembershipController
 * Base URL: /api/memberships
 */
@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    /** GET /api/memberships — Admin only */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MembershipDTO>> getAllMemberships() {
        return ResponseEntity.ok(membershipService.getAllMemberships());
    }

    /** GET /api/memberships/member/{memberId} — Admin or the member themselves */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<List<MembershipDTO>> getMembershipsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(membershipService.getMembershipsByMember(memberId));
    }

    /** GET /api/memberships/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<MembershipDTO> getMembershipById(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.getMembershipById(id));
    }

    /** POST /api/memberships — Admin only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipDTO> createMembership(@Valid @RequestBody CreateMembershipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membershipService.createMembership(request));
    }

    /** PATCH /api/memberships/{id}/status — Admin only */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipDTO> updateStatus(@PathVariable Long id,
                                                       @RequestParam Membership.MembershipStatus status) {
        return ResponseEntity.ok(membershipService.updateStatus(id, status));
    }
}
