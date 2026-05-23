package com.gym.dto;

import java.util.List;

/**
 * AdminSummaryDTO — payload for GET /api/dashboard/summary.
 *
 * Contains:
 *  - totalMembers       : total registered members
 *  - totalTrainers      : total registered trainers
 *  - presentTrainers    : trainers who checked in today (from attendance table)
 *  - memberPurchases    : every member → plan mapping (all memberships)
 */
public class AdminSummaryDTO {

    private long totalMembers;
    private long totalTrainers;
    private List<TrainerPresenceDTO> presentTrainers;
    private List<MemberPurchaseDTO> memberPurchases;

    // ── Getters & Setters ────────────────────────────────────────────────────

    public long getTotalMembers()  { return totalMembers; }
    public void setTotalMembers(long v) { this.totalMembers = v; }

    public long getTotalTrainers() { return totalTrainers; }
    public void setTotalTrainers(long v) { this.totalTrainers = v; }

    public List<TrainerPresenceDTO> getPresentTrainers() { return presentTrainers; }
    public void setPresentTrainers(List<TrainerPresenceDTO> v) { this.presentTrainers = v; }

    public List<MemberPurchaseDTO> getMemberPurchases() { return memberPurchases; }
    public void setMemberPurchases(List<MemberPurchaseDTO> v) { this.memberPurchases = v; }

    // ── Nested: trainer presence ─────────────────────────────────────────────

    public static class TrainerPresenceDTO {
        private Long   id;
        private String name;
        private String status;   // "Present" or "Absent"
        private String checkIn;  // time string, null if absent

        public TrainerPresenceDTO() {}
        public TrainerPresenceDTO(Long id, String name, String status, String checkIn) {
            this.id      = id;
            this.name    = name;
            this.status  = status;
            this.checkIn = checkIn;
        }

        public Long   getId()      { return id; }
        public void   setId(Long v){ this.id = v; }
        public String getName()    { return name; }
        public void   setName(String v) { this.name = v; }
        public String getStatus()  { return status; }
        public void   setStatus(String v) { this.status = v; }
        public String getCheckIn() { return checkIn; }
        public void   setCheckIn(String v) { this.checkIn = v; }
    }

    // ── Nested: member purchase ──────────────────────────────────────────────

    public static class MemberPurchaseDTO {
        private Long   memberId;
        private String memberName;
        private String memberEmail;
        private String plan;
        private String status;        // ACTIVE / EXPIRED / CANCELLED / PENDING
        private String purchaseDate;  // startDate formatted as yyyy-MM-dd
        private String expiryDate;    // endDate formatted as yyyy-MM-dd

        public MemberPurchaseDTO() {}

        public Long   getMemberId()    { return memberId; }
        public void   setMemberId(Long v) { this.memberId = v; }
        public String getMemberName()  { return memberName; }
        public void   setMemberName(String v) { this.memberName = v; }
        public String getMemberEmail() { return memberEmail; }
        public void   setMemberEmail(String v) { this.memberEmail = v; }
        public String getPlan()        { return plan; }
        public void   setPlan(String v){ this.plan = v; }
        public String getStatus()      { return status; }
        public void   setStatus(String v) { this.status = v; }
        public String getPurchaseDate(){ return purchaseDate; }
        public void   setPurchaseDate(String v) { this.purchaseDate = v; }
        public String getExpiryDate()  { return expiryDate; }
        public void   setExpiryDate(String v) { this.expiryDate = v; }
    }
}
