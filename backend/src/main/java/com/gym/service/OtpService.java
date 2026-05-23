package com.gym.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private final ConcurrentHashMap<String, OtpDetails> otpCache = new ConcurrentHashMap<>();
    private final Random random = new Random();

    /**
     * Generates a 6-digit OTP, stores it in memory with an expiration, and returns it.
     */
    public String generateOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        String otp = String.format("%06d", random.nextInt(1000000));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        
        otpCache.put(normalizedEmail, new OtpDetails(otp, expiryTime));
        return otp;
    }

    /**
     * Verifies the OTP for a given email. Returns true if match and not expired.
     */
    public boolean verifyOtp(String email, String otp) {
        if (otp == null || otp.trim().isEmpty()) {
            return false;
        }
        
        String normalizedEmail = email.trim().toLowerCase();
        OtpDetails details = otpCache.get(normalizedEmail);
        
        if (details == null) {
            return false;
        }
        
        if (details.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpCache.remove(normalizedEmail); // Clear expired
            return false;
        }
        
        return details.getOtp().equals(otp.trim());
    }

    /**
     * Explicitly clears the OTP for a given email after successful reset.
     */
    public void clearOtp(String email) {
        otpCache.remove(email.trim().toLowerCase());
    }

    // ---- Inner Helper Class ----
    private static class OtpDetails {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OtpDetails(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiryTime() {
            return expiryTime;
        }
    }
}
