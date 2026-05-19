package com.gym.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Attendance — records a single gym visit (check-in / check-out) for a user.
 *
 * Logic:
 *  - First call to markAttendance() today  → creates record with checkInTime, no checkOutTime
 *  - Second call to markAttendance() today → fills in checkOutTime (toggle)
 */
@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Calendar date of the visit — used to find today's record */
    @Column(nullable = false)
    private LocalDate date;

    /** Time the member checked in */
    @Column(nullable = false)
    private LocalDateTime checkInTime;

    /** Time the member checked out — null if still active */
    private LocalDateTime checkOutTime;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────

    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }

    public User getUser()                        { return user; }
    public void setUser(User user)               { this.user = user; }

    public LocalDate getDate()                   { return date; }
    public void setDate(LocalDate date)          { this.date = date; }

    public LocalDateTime getCheckInTime()        { return checkInTime; }
    public void setCheckInTime(LocalDateTime t)  { this.checkInTime = t; }

    public LocalDateTime getCheckOutTime()       { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime t) { this.checkOutTime = t; }

    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime t)    { this.createdAt = t; }
}
