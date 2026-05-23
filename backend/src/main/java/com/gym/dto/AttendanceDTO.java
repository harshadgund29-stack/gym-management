package com.gym.dto;

import java.time.LocalDateTime;

public class AttendanceDTO {

    private Long id;
    private Long userId;
    private String userName;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String status;
    private Long markedById;
    private String markedByName;

    // ---- Getters & Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDateTime getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDateTime checkIn) { this.checkIn = checkIn; }

    public LocalDateTime getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDateTime checkOut) { this.checkOut = checkOut; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getMarkedById() { return markedById; }
    public void setMarkedById(Long markedById) { this.markedById = markedById; }

    public String getMarkedByName() { return markedByName; }
    public void setMarkedByName(String markedByName) { this.markedByName = markedByName; }
}
