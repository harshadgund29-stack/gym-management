package com.gym.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * ResetPasswordDto — used for both OTP-based and token-based password reset.
 *
 * token is optional — the OTP flow uses the generatedTime window instead.
 * newPassword is required and must be at least 6 characters.
 */
public class ResetPasswordDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    /** Optional — used for token-based reset (link email flow). Null/blank = OTP flow. */
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;

    public String getEmail()                     { return email; }
    public void setEmail(String email)           { this.email = email; }

    public String getToken()                     { return token; }
    public void setToken(String token)           { this.token = token; }

    public String getNewPassword()               { return newPassword; }
    public void setNewPassword(String v)         { this.newPassword = v; }
}
