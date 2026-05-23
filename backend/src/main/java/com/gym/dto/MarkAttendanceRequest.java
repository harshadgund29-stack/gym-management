package com.gym.dto;

import jakarta.validation.constraints.NotNull;

public class MarkAttendanceRequest {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    // ---- Getters & Setters ----
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
}
