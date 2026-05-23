package com.gym.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalMembers;
    private long totalTrainers;
    private long activeMembers;
    private long totalPlans;
    private BigDecimal totalRevenue;
    private long paymentsThisMonth;
    private long totalSessions;
    private long todayAttendanceCount;
    // Last 6 months revenue for the bar chart: [{month:"Dec 2025", revenue:12000}, ...]
    private List<Map<String, Object>> monthlyRevenue;

    public DashboardStatsDTO() {}

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long v) { this.totalMembers = v; }

    public long getTotalTrainers() { return totalTrainers; }
    public void setTotalTrainers(long v) { this.totalTrainers = v; }

    public long getActiveMembers() { return activeMembers; }
    public void setActiveMembers(long v) { this.activeMembers = v; }

    public long getTotalPlans() { return totalPlans; }
    public void setTotalPlans(long v) { this.totalPlans = v; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal v) { this.totalRevenue = v; }

    public long getPaymentsThisMonth() { return paymentsThisMonth; }
    public void setPaymentsThisMonth(long v) { this.paymentsThisMonth = v; }

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long v) { this.totalSessions = v; }

    public long getTodayAttendanceCount() { return todayAttendanceCount; }
    public void setTodayAttendanceCount(long v) { this.todayAttendanceCount = v; }

    public List<Map<String, Object>> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<Map<String, Object>> v) { this.monthlyRevenue = v; }
}

