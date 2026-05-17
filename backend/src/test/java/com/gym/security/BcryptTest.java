package com.gym.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class BcryptTest {

    @Test
    public void testHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String sampleAdminHash = "$2a$10$slYQmyNdgTY18LGvgxPwHOSQKeIsa6T8W5dyabHd/R2X6B7Gy5i6S";
        String sampleUserHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        
        // Print the correct hashes
        System.out.println("Correct Admin Hash (123456): " + encoder.encode("123456"));
        System.out.println("Correct User Hash (password123): " + encoder.encode("password123"));
        
        // Check if the hashes from sample_data.sql are valid
        boolean adminMatch = encoder.matches("123456", sampleAdminHash);
        boolean userMatch = encoder.matches("password123", sampleUserHash);
        
        System.out.println("Admin hash in sample_data.sql matches '123456': " + adminMatch);
        System.out.println("User hash in sample_data.sql matches 'password123': " + userMatch);
    }
}
