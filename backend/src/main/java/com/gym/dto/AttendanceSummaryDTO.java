package com.gym.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Payload for GET /api/attendance/summary — gym floor dashboard metrics.
 */
public class AttendanceSummaryDTO {

    private long totalCheckInsToday;
    private long activeOnFloor;
    private long completedSessions;
    private long totalMembers;
    private List<AttendanceDTO> roster = new ArrayList<>();

    public long getTotalCheckInsToday() { return totalCheckInsToday; }
    public void setTotalCheckInsToday(long totalCheckInsToday) { this.totalCheckInsToday = totalCheckInsToday; }

    public long getActiveOnFloor() { return activeOnFloor; }
    public void setActiveOnFloor(long activeOnFloor) { this.activeOnFloor = activeOnFloor; }

    public long getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(long completedSessions) { this.completedSessions = completedSessions; }

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }

    public List<AttendanceDTO> getRoster() { return roster; }
    public void setRoster(List<AttendanceDTO> roster) { this.roster = roster; }
}
