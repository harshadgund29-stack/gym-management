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
 * DataInitializer — runs once on application startup.
 *
 * Ensures the admin account always exists with the correct credentials:
 *   Email:    admin@gmail.com
 *   Password: 123456
 *
 * If the admin already exists, it updates the password to ensure it matches.
 * This guarantees admin login always works regardless of database state.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private static final String ADMIN_EMAIL    = "admin@gmail.com";
    private static final String ADMIN_PASSWORD = "123456";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initAdmin();
    }

    private void initAdmin() {
        userRepository.findByEmail(ADMIN_EMAIL).ifPresentOrElse(
            existingAdmin -> {
                // Admin exists — ensure password is correct (re-hash and update)
                existingAdmin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                existingAdmin.setRole(Role.ADMIN);
                userRepository.save(existingAdmin);
                logger.info("Admin account verified: {}", ADMIN_EMAIL);
            },
            () -> {
                // Admin does not exist — create it
                User admin = new User();
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setEmail(ADMIN_EMAIL);
                admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                admin.setRole(Role.ADMIN);
                admin.setPhone("555-0001");
                admin.setAddress("1 Admin Street");
                userRepository.save(admin);
                logger.info("Admin account created: {}", ADMIN_EMAIL);
            }
        );
    }
}
