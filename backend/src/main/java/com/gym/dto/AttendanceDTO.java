package com.gym.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * AttendanceDTO — returned by all attendance endpoints.
 *
 * Frontend expects these exact field names (see attendanceService.js comments):
 *   id, userId, userFirstName, userLastName, userEmail,
 *   checkInTime, checkOutTime, date
 */
public class AttendanceDTO {

    private Long          id;
    private Long          userId;
    private String        userFirstName;
    private String        userLastName;
    private String        userEmail;
    private LocalDate     date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    // ── Getters & Setters ─────────────────────────────────────

    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }

    public Long getUserId()                          { return userId; }
    public void setUserId(Long userId)               { this.userId = userId; }

    public String getUserFirstName()                 { return userFirstName; }
    public void setUserFirstName(String v)           { this.userFirstName = v; }

    public String getUserLastName()                  { return userLastName; }
    public void setUserLastName(String v)            { this.userLastName = v; }

    public String getUserEmail()                     { return userEmail; }
    public void setUserEmail(String v)               { this.userEmail = v; }

    public LocalDate getDate()                       { return date; }
    public void setDate(LocalDate date)              { this.date = date; }

    public LocalDateTime getCheckInTime()            { return checkInTime; }
    public void setCheckInTime(LocalDateTime t)      { this.checkInTime = t; }

    public LocalDateTime getCheckOutTime()           { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime t)     { this.checkOutTime = t; }
}
