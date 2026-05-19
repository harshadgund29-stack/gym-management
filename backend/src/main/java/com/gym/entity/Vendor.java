package com.gym.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String companyName;
    private String contactNumber;

    public Long getVId()                         { return vId; }
    public void setVId(Long vId)                 { this.vId = vId; }

    public User getUser()                        { return user; }
    public void setUser(User user)               { this.user = user; }

    public String getCompanyName()               { return companyName; }
    public void setCompanyName(String v)         { this.companyName = v; }

    public String getContactNumber()             { return contactNumber; }
    public void setContactNumber(String v)       { this.contactNumber = v; }
}
