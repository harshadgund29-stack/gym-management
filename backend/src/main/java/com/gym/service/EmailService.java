package com.gym.service;

public interface EmailService {
    void sendOTP(String toEmail, int otp);

    void sendPasswordResetEmail(String toEmail, String firstName, String resetLink);
}

