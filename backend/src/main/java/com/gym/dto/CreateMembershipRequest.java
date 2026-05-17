package com.gym.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateMembershipRequest {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    @NotNull(message = "Plan ID is required")
    private Long planId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
}
