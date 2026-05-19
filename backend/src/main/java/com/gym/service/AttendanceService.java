package com.gym.service;

import com.gym.dto.AttendanceDTO;
import com.gym.entity.Attendance;
import com.gym.entity.User;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.AttendanceRepository;
import com.gym.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AttendanceService — handles check-in / check-out toggle logic.
 *
 * Toggle behaviour:
 *   - No record today  → create record with checkInTime = now
 *   - Record exists, no checkOutTime → set checkOutTime = now
 *   - Record exists, checkOutTime set → reset: new check-in (delete old, create new)
 */
@Service
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private UserRepository       userRepository;

    // ── Mark attendance (self) ────────────────────────────────

    @Transactional
    public AttendanceDTO markAttendance(String email) {
        User user = findByEmail(email);
        return toggle(user);
    }

    // ── Mark attendance for a specific user (admin/trainer) ───

    @Transactional
    public AttendanceDTO markForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toggle(user);
    }

    // ── Get own attendance history ────────────────────────────

    public List<AttendanceDTO> getMyAttendance(String email) {
        User user = findByEmail(email);
        return attendanceRepository
                .findByUserOrderByDateDescCheckInTimeDesc(user)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Get own total check-in count ──────────────────────────

    public Map<String, Long> getMyCount(String email) {
        User user = findByEmail(email);
        long count = attendanceRepository.countByUser(user);
        return Map.of("count", count);
    }

    // ── Get today's attendance (admin/trainer) ────────────────

    public List<AttendanceDTO> getTodayAttendance() {
        return attendanceRepository
                .findByDateOrderByCheckInTimeDesc(LocalDate.now())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Get all attendance (admin) ────────────────────────────

    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────

    private AttendanceDTO toggle(User user) {
        LocalDate today = LocalDate.now();
        java.util.Optional<Attendance> existing =
                attendanceRepository.findByUserAndDate(user, today);

        Attendance record;

        if (existing.isEmpty()) {
            // No record today → check in
            record = new Attendance();
            record.setUser(user);
            record.setDate(today);
            record.setCheckInTime(LocalDateTime.now());
            log.info("Check-in: {} on {}", user.getEmail(), today);

        } else {
            record = existing.get();
            if (record.getCheckOutTime() == null) {
                // Checked in but not out → check out
                record.setCheckOutTime(LocalDateTime.now());
                log.info("Check-out: {} on {}", user.getEmail(), today);
            } else {
                // Already checked out → start a new check-in (reset)
                attendanceRepository.delete(record);
                record = new Attendance();
                record.setUser(user);
                record.setDate(today);
                record.setCheckInTime(LocalDateTime.now());
                log.info("Re-check-in: {} on {}", user.getEmail(), today);
            }
        }

        return toDTO(attendanceRepository.save(record));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private AttendanceDTO toDTO(Attendance a) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(a.getId());
        dto.setDate(a.getDate());
        dto.setCheckInTime(a.getCheckInTime());
        dto.setCheckOutTime(a.getCheckOutTime());
        if (a.getUser() != null) {
            dto.setUserId(a.getUser().getId());
            dto.setUserFirstName(a.getUser().getFirstName());
            dto.setUserLastName(a.getUser().getLastName());
            dto.setUserEmail(a.getUser().getEmail());
        }
        return dto;
    }
}
