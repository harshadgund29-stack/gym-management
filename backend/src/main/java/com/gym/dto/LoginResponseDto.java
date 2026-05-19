package com.gym.dto;

public class LoginResponseDto {
    private String token;
    private String role;
    private String email;
    private Long id;
    private Long vId;

    public LoginResponseDto() {
    }

    public LoginResponseDto(String token, String role, String email, Long id, Long vId) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.id = id;
        this.vId = vId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getvId() {
        return vId;
    }

    public void setvId(Long vId) {
        this.vId = vId;
    }
}
