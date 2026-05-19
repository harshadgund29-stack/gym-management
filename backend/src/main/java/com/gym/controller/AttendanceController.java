package com.gym.controller;

import com.gym.dto.AttendanceDTO;
import com.gym.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * AttendanceController
 * Base URL: /api/attendance
 *
 * Endpoints:
 *   POST /api/attendance/mark              — member self check-in/out
 *   POST /api/attendance/mark/{userId}     — admin/trainer marks for a member
 *   GET  /api/attendance/my               — own attendance history
 *   GET  /api/attendance/my/count         — own total check-in count  { "count": N }
 *   GET  /api/attendance/today            — today's check-ins (admin/trainer)
 *   GET  /api/attendance                  — all records (admin only)
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // ── Self check-in / check-out ─────────────────────────────

    /** POST /api/attendance/mark — toggle check-in/out for the logged-in user */
    @PostMapping("/mark")
    public ResponseEntity<AttendanceDTO> markAttendance(Principal principal) {
        return ResponseEntity.ok(attendanceService.markAttendance(principal.getName()));
    }

    // ── Admin / Trainer mark for a specific member ────────────

    /** POST /api/attendance/mark/{userId} — admin or trainer marks for a member */
    @PostMapping("/mark/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceDTO> markForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.markForUser(userId));
    }

    // ── Own attendance ────────────────────────────────────────

    /** GET /api/attendance/my — own full attendance history */
    @GetMapping("/my")
    public ResponseEntity<List<AttendanceDTO>> getMyAttendance(Principal principal) {
        return ResponseEntity.ok(attendanceService.getMyAttendance(principal.getName()));
    }

    /** GET /api/attendance/my/count — own total check-in count */
    @GetMapping("/my/count")
    public ResponseEntity<Map<String, Long>> getMyCount(Principal principal) {
        return ResponseEntity.ok(attendanceService.getMyCount(principal.getName()));
    }

    // ── Admin / Trainer views ─────────────────────────────────

    /** GET /api/attendance/today — all check-ins for today */
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<AttendanceDTO>> getTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }

    /** GET /api/attendance — all attendance records (admin only) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}
