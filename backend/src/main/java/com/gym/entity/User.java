package com.gym.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.math.BigInteger;
import java.time.LocalDateTime;

/**
 * User — canonical JPA entity for the `users` table.
 *
 * Fields match the spec exactly:
 *   id, firstName, lastName, email, password, role (Role enum),
 *   phone, address, createdAt, updatedAt, otp (Integer), generatedTime (BigInteger)
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String phone;
    private String address;

    /** 6-digit OTP for password reset */
    private Integer otp;

    /** System.currentTimeMillis() when OTP was generated */
    @Column(name = "generated_time")
    private BigInteger generatedTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────

    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }

    public String getFirstName()                 { return firstName; }
    public void setFirstName(String v)           { this.firstName = v; }

    public String getLastName()                  { return lastName; }
    public void setLastName(String v)            { this.lastName = v; }

    public String getEmail()                     { return email; }
    public void setEmail(String v)               { this.email = v; }

    public String getPassword()                  { return password; }
    public void setPassword(String v)            { this.password = v; }

    public Role getRole()                        { return role; }
    public void setRole(Role v)                  { this.role = v; }

    public String getPhone()                     { return phone; }
    public void setPhone(String v)               { this.phone = v; }

    public String getAddress()                   { return address; }
    public void setAddress(String v)             { this.address = v; }

    public Integer getOtp()                      { return otp; }
    public void setOtp(Integer v)                { this.otp = v; }

    public BigInteger getGeneratedTime()         { return generatedTime; }
    public void setGeneratedTime(BigInteger v)   { this.generatedTime = v; }

    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }

    public LocalDateTime getUpdatedAt()          { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)    { this.updatedAt = v; }

    /** Convenience: full name for display */
    public String getFullName() {
        String f = firstName != null ? firstName : "";
        String l = lastName  != null ? lastName  : "";
        return (f + " " + l).trim();
    }
}
