package com.gym.service;

import com.gym.dto.AdminSummaryDTO;
import com.gym.dto.DashboardStatsDTO;
import com.gym.entity.Attendance;
import com.gym.entity.Membership;
import com.gym.entity.Role;
import com.gym.entity.User;
import com.gym.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

/**
 * DashboardService — aggregates statistics for the admin dashboard.
 */
@Service
public class DashboardService {

    @Autowired private UserRepository userRepository;
    @Autowired private MembershipRepository membershipRepository;
    @Autowired private MembershipPlanRepository planRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private TrainingSessionRepository sessionRepository;
    @Autowired private AttendanceRepository attendanceRepository;

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalMembers(userRepository.countByRole(Role.MEMBER));
        stats.setTotalTrainers(userRepository.countByRole(Role.TRAINER));
        stats.setActiveMembers(membershipRepository.countByStatus(Membership.MembershipStatus.ACTIVE));
        stats.setTotalPlans(planRepository.count());
        stats.setTotalRevenue(paymentRepository.getTotalRevenue());
        stats.setPaymentsThisMonth(paymentRepository.countPaymentsThisMonth());
        stats.setTotalSessions(sessionRepository.count());
        
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        stats.setTodayAttendanceCount(attendanceRepository.countTodayCheckIns(start, end));
        
        stats.setMonthlyRevenue(buildMonthlyRevenue());
        return stats;
    }


    /** Build last 6 months of revenue data for the dashboard bar chart */
    private List<Map<String, Object>> buildMonthlyRevenue() {        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate date  = now.minusMonths(i);
            int month       = date.getMonthValue();
            int year        = date.getYear();
            String label    = date.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", label);
            entry.put("revenue", paymentRepository.getRevenueByMonthAndYear(month, year));
            result.add(entry);
        }
        return result;
    }

    // ── Admin Summary ────────────────────────────────────────────────────────

    /**
     * GET /api/dashboard/summary
     *
     * Returns:
     *  - totalMembers / totalTrainers counts
     *  - every trainer with Present/Absent status based on today's attendance
     *  - every membership record (member → plan mapping)
     */
    @Transactional(readOnly = true)
    public AdminSummaryDTO getSummary() {
        AdminSummaryDTO summary = new AdminSummaryDTO();

        // 1. Counts
        summary.setTotalMembers(userRepository.countByRole(Role.MEMBER));
        summary.setTotalTrainers(userRepository.countByRole(Role.TRAINER));

        // 2. Trainer presence — cross-reference all trainers with today's attendance
        LocalDateTime dayStart = LocalDate.now().atStartOfDay();
        LocalDateTime dayEnd   = LocalDate.now().atTime(LocalTime.MAX);
        List<Attendance> todayLogs = attendanceRepository
                .findByCheckInBetweenOrderByCheckInDesc(dayStart, dayEnd);

        // Build a set of user IDs who checked in today
        Set<Long> checkedInToday = new HashSet<>();
        Map<Long, String> checkInTimes = new HashMap<>();
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        for (Attendance a : todayLogs) {
            if (a.getUser() != null) {
                checkedInToday.add(a.getUser().getId());
                if (a.getCheckIn() != null) {
                    checkInTimes.put(a.getUser().getId(), a.getCheckIn().format(timeFmt));
                }
            }
        }

        List<User> trainers = userRepository.findByRole(Role.TRAINER);
        List<AdminSummaryDTO.TrainerPresenceDTO> presenceList = new ArrayList<>();
        for (User t : trainers) {
            boolean present = checkedInToday.contains(t.getId());
            presenceList.add(new AdminSummaryDTO.TrainerPresenceDTO(
                    t.getId(),
                    t.getFirstName() + " " + t.getLastName(),
                    present ? "Present" : "Absent",
                    present ? checkInTimes.get(t.getId()) : null
            ));
        }
        // Sort: Present first, then alphabetically
        presenceList.sort(Comparator
                .comparing((AdminSummaryDTO.TrainerPresenceDTO d) -> d.getStatus().equals("Present") ? 0 : 1)
                .thenComparing(AdminSummaryDTO.TrainerPresenceDTO::getName));
        summary.setPresentTrainers(presenceList);

        // 3. Member purchases — all memberships ordered by most recent first
        List<Membership> memberships = membershipRepository.findAllWithMemberAndPlan();
        memberships.sort(Comparator.comparing(Membership::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<AdminSummaryDTO.MemberPurchaseDTO> purchases = new ArrayList<>();
        for (Membership m : memberships) {
            AdminSummaryDTO.MemberPurchaseDTO dto = new AdminSummaryDTO.MemberPurchaseDTO();
            if (m.getMember() != null) {
                dto.setMemberId(m.getMember().getId());
                dto.setMemberName(m.getMember().getFirstName() + " " + m.getMember().getLastName());
                dto.setMemberEmail(m.getMember().getEmail());
            }
            if (m.getPlan() != null) {
                dto.setPlan(m.getPlan().getName());
            }
            dto.setStatus(m.getStatus().name());
            dto.setPurchaseDate(m.getStartDate() != null ? m.getStartDate().format(dateFmt) : null);
            dto.setExpiryDate(m.getEndDate() != null ? m.getEndDate().format(dateFmt) : null);
            purchases.add(dto);
        }
        summary.setMemberPurchases(purchases);

        return summary;
    }
}
