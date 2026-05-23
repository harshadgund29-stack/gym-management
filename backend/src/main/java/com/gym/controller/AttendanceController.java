package com.gym.controller;

import com.gym.dto.AttendanceDTO;
import com.gym.dto.AttendanceSummaryDTO;
import com.gym.dto.MarkAttendanceRequest;
import com.gym.entity.User;
import com.gym.entity.Role;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.UserRepository;
import com.gym.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * AttendanceController — handles all gym check-ins and attendance history.
 * Base URL: /api/attendance
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/attendance/mark — Member self check-in
     * Checks in the currently logged-in authenticated user.
     */
    @PostMapping("/mark")
    public ResponseEntity<AttendanceDTO> markSelfCheckIn(Principal principal) {
        String email = principal.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        return ResponseEntity.ok(attendanceService.checkIn(currentUser.getId(), null));
    }

    /**
     * POST /api/attendance/mark/{userId} — Trainer/Admin marks attendance for member
     * Checks in a target user. Restricted to Admin and Trainer.
     */
    @PostMapping("/mark/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceDTO> markUserCheckIn(@PathVariable Long userId, Principal principal) {
        String email = principal.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        return ResponseEntity.ok(attendanceService.checkIn(userId, currentUser.getId()));
    }

    /**
     * GET /api/attendance/my — Member's own check-in history
     * Returns history of the currently logged-in user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<AttendanceDTO>> getMyHistory(Principal principal) {
        String email = principal.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        return ResponseEntity.ok(attendanceService.getMemberHistory(currentUser.getId()));
    }

    /**
     * GET /api/attendance/my/count — Member's check-in count
     * Returns count of visits for the currently logged-in user.
     */
    @GetMapping("/my/count")
    public ResponseEntity<Map<String, Object>> getMyCount(Principal principal) {
        String email = principal.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        List<AttendanceDTO> history = attendanceService.getMemberHistory(currentUser.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("count", history.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/attendance/summary — Gym floor metrics and today's roster
     * Restricted to Admin and Trainer.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceSummaryDTO> getSummary() {
        return ResponseEntity.ok(attendanceService.getSummary());
    }

    /**
     * GET /api/attendance/today — Today's attendance roster
     * Restricted to Admin and Trainer.
     */
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<AttendanceDTO>> getTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }

    /**
     * GET /api/attendance — All attendance records in system
     * Restricted to Admin only.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    // ==========================================
    // Backward Compatibility Endpoints
    // ==========================================

    @PostMapping("/checkin")
    public ResponseEntity<AttendanceDTO> checkIn(@RequestBody(required = false) MarkAttendanceRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentEmail));

        Long targetMemberId;
        Long markedById = null;

        if (currentUser.getRole() == Role.MEMBER) {
            targetMemberId = currentUser.getId();
        } else {
            if (request == null || request.getMemberId() == null) {
                return ResponseEntity.badRequest().build();
            }
            targetMemberId = request.getMemberId();
            markedById = currentUser.getId();
        }

        return ResponseEntity.ok(attendanceService.checkIn(targetMemberId, markedById));
    }

    @PostMapping("/checkout")
    public ResponseEntity<AttendanceDTO> checkOut(@RequestBody(required = false) MarkAttendanceRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentEmail));

        Long targetMemberId;

        if (currentUser.getRole() == Role.MEMBER) {
            targetMemberId = currentUser.getId();
        } else {
            if (request == null || request.getMemberId() == null) {
                return ResponseEntity.badRequest().build();
            }
            targetMemberId = request.getMemberId();
        }

        return ResponseEntity.ok(attendanceService.checkOut(targetMemberId));
    }

    @GetMapping("/history/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<List<AttendanceDTO>> getMemberHistory(@PathVariable Long memberId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentEmail));

        if (currentUser.getRole() == Role.MEMBER && !currentUser.getId().equals(memberId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(attendanceService.getMemberHistory(memberId));
    }

    @GetMapping("/stats/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<Map<String, Object>> getMemberStats(@PathVariable Long memberId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentEmail));

        if (currentUser.getRole() == Role.MEMBER && !currentUser.getId().equals(memberId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(attendanceService.getMemberStats(memberId));
    }
}
