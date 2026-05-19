package com.gym.config;

import com.gym.entity.Role;
import com.gym.entity.User;
import com.gym.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer — seeds default accounts on every startup.
 *
 * Accounts created (if they don't already exist):
 * ┌─────────────────────────────┬──────────────┬─────────┐
 * │ Email                       │ Password     │ Role    │
 * ├─────────────────────────────┼──────────────┼─────────┤
 * │ admin@gmail.com             │ 123456       │ ADMIN   │
 * │ trainer@fitpro.com          │ trainer123   │ TRAINER │
 * │ member@fitpro.com           │ member123    │ MEMBER  │
 * └─────────────────────────────┴──────────────┴─────────┘
 *
 * Passwords are always re-hashed on startup to ensure they match
 * even if the DB was seeded with a different BCrypt round count.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin@gmail.com",    "Admin",   "User",    "123456",     Role.ADMIN,   "555-0001", "1 Admin Street");
        seedUser("trainer@fitpro.com", "John",    "Trainer", "trainer123", Role.TRAINER, "555-0002", "2 Trainer Ave");
        seedUser("member@fitpro.com",  "Jane",    "Member",  "member123",  Role.MEMBER,  "555-0003", "3 Member Road");
    }

    private void seedUser(String email, String firstName, String lastName,
                          String rawPassword, Role role, String phone, String address) {
        userRepository.findByEmail(email).ifPresentOrElse(
            existing -> {
                // Always re-hash to ensure password is correct
                existing.setPassword(passwordEncoder.encode(rawPassword));
                existing.setRole(role);
                userRepository.save(existing);
                log.info("✓ {} account verified: {}", role, email);
            },
            () -> {
                User user = new User();
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setRole(role);
                user.setPhone(phone);
                user.setAddress(address);
                userRepository.save(user);
                log.info("✓ {} account created: {}", role, email);
            }
        );
    }
}
