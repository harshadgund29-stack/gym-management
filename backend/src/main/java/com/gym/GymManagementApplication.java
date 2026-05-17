package com.gym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Gym Management System backend.
 * @SpringBootApplication enables auto-configuration, component scanning, and configuration.
 */
@SpringBootApplication
public class GymManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymManagementApplication.class, args);
    }
}
