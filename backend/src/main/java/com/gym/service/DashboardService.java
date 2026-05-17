package com.gym.service;

import com.gym.dto.DashboardStatsDTO;
import com.gym.entity.Membership;
import com.gym.entity.Role;
import com.gym.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalMembers(userRepository.findByRole(Role.MEMBER).size());
        stats.setTotalTrainers(userRepository.findByRole(Role.TRAINER).size());
        stats.setActiveMembers(membershipRepository.countByStatus(Membership.MembershipStatus.ACTIVE));
        stats.setTotalPlans(planRepository.count());
        stats.setTotalRevenue(paymentRepository.getTotalRevenue());
        stats.setPaymentsThisMonth(paymentRepository.countPaymentsThisMonth());
        stats.setTotalSessions(sessionRepository.count());
        stats.setMonthlyRevenue(buildMonthlyRevenue());
        return stats;
    }

    /** Build last 6 months of revenue data for the dashboard bar chart */
    private List<Map<String, Object>> buildMonthlyRevenue() {
        List<Map<String, Object>> result = new ArrayList<>();
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
}
