package com.gym.dto;

import com.gym.entity.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;

    // Serialized as "ROLE_ADMIN" / "ROLE_TRAINER" / "ROLE_MEMBER"
    // so the React frontend can do: user.role === 'ROLE_ADMIN'
    private String role;

    @JsonIgnore
    private Role roleEnum;

    public AuthResponse() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // Returns "ROLE_ADMIN", "ROLE_TRAINER", or "ROLE_MEMBER"
    public String getRole() { return role; }

    // Accept raw Role enum and prefix with ROLE_
    public void setRole(Role role) {
        this.roleEnum = role;
        this.role = role != null ? "ROLE_" + role.name() : null;
    }
}
