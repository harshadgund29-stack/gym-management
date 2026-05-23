package com.gym.service;

import com.gym.dto.AttendanceDTO;
import com.gym.dto.AttendanceSummaryDTO;
import com.gym.entity.Attendance;
import com.gym.entity.Role;
import com.gym.entity.User;
import com.gym.exception.BadRequestException;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.AttendanceRepository;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Records a gym check-in for a member.
     */
    @Transactional
    public AttendanceDTO checkIn(Long memberId, Long markedById) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));

        // Check if there is an active session (already checked in, not checked out yet)
        Optional<Attendance> activeSession = attendanceRepository.findTopByUserAndCheckOutIsNullOrderByCheckInDesc(member);
        if (activeSession.isPresent()) {
            throw new BadRequestException("You are already checked in! Stay focused and train insane! 💪");
        }

        Attendance attendance = new Attendance();
        attendance.setUser(member);
        attendance.setCheckIn(LocalDateTime.now());
        attendance.setStatus("CHECKED_IN");

        if (markedById != null) {
            User marker = userRepository.findById(markedById)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", markedById));
            attendance.setMarkedBy(marker);
        }

        return toDTO(attendanceRepository.save(attendance));
    }

    /**
     * Records a checkout for an active check-in session.
     */
    @Transactional
    public AttendanceDTO checkOut(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));

        Attendance attendance = attendanceRepository.findTopByUserAndCheckOutIsNullOrderByCheckInDesc(member)
                .orElseThrow(() -> new BadRequestException("No active check-in found for this session. Please check in first!"));

        attendance.setCheckOut(LocalDateTime.now());
        attendance.setStatus("COMPLETED");

        return toDTO(attendanceRepository.save(attendance));
    }

    /**
     * Fetches attendance history for a single member.
     */
    public List<AttendanceDTO> getMemberHistory(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));

        return attendanceRepository.findByUserOrderByCheckInDesc(member)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Gym floor summary for admin dashboard: today's metrics and roster.
     */
    public AttendanceSummaryDTO getSummary() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);

        AttendanceSummaryDTO summary = new AttendanceSummaryDTO();
        summary.setTotalCheckInsToday(attendanceRepository.countTodayCheckIns(start, end));
        summary.setActiveOnFloor(attendanceRepository.countActiveToday(start, end));
        summary.setCompletedSessions(attendanceRepository.countCompletedToday(start, end));
        summary.setTotalMembers(userRepository.countByRole(Role.MEMBER));
        summary.setRoster(getTodayAttendance());
        return summary;
    }

    /**
     * Retrieves today's attendance logs for administrators and trainers.
     */
    public List<AttendanceDTO> getTodayAttendance() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        
        return attendanceRepository.findByCheckInBetweenOrderByCheckInDesc(start, end)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Returns stats for a member: total visits, loyalty points (10 points per visit),
     * and today's active session if present.
     */
    public Map<String, Object> getMemberStats(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));

        long totalVisits = attendanceRepository.countByUser(member);
        long loyaltyPoints = totalVisits * 10; // Earn 10 points per check-in!

        Optional<Attendance> activeSession = attendanceRepository.findTopByUserAndCheckOutIsNullOrderByCheckInDesc(member);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVisits", totalVisits);
        stats.put("loyaltyPoints", loyaltyPoints);
        stats.put("isCheckedIn", activeSession.isPresent());
        
        if (activeSession.isPresent()) {
            stats.put("activeSession", toDTO(activeSession.get()));
        } else {
            stats.put("activeSession", null);
        }

        return stats;
    }

    /**
     * Retrieves all attendance logs in the system (Admin only).
     */
    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Conversions from Entity to DTO */
    private AttendanceDTO toDTO(Attendance a) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(a.getId());
        dto.setUserId(a.getUser().getId());
        dto.setUserName(a.getUser().getFirstName() + " " + a.getUser().getLastName());
        dto.setCheckIn(a.getCheckIn());
        dto.setCheckOut(a.getCheckOut());
        dto.setStatus(a.getStatus());
        
        if (a.getMarkedBy() != null) {
            dto.setMarkedById(a.getMarkedBy().getId());
            dto.setMarkedByName(a.getMarkedBy().getFirstName() + " " + a.getMarkedBy().getLastName());
        }
        
        return dto;
    }
}
