package com.gym.security;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class DatabaseFixer {

    @Test
    public void fixDatabase() {
        String url = "jdbc:mysql://localhost:3306/gym_management?useSSL=false&allowPublicKeyRetrieval=true";
        String user = "root";
        String pass = "harshadgund@25";

        String adminHash = "$2a$10$qpki1DXjLMF3pmsg/poiM.F0rr9ttc5.S7WtSM1.5AgwVLV9zRjFy";
        String userHash = "$2a$10$qP8ZYKx84XaEk5PKuIKZNOtF6dG9aWgOaJObSy6nAD/KfxPRMJn7W";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            
            // Update Admin password
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE users SET password = ? WHERE role = 'ADMIN'")) {
                stmt.setString(1, adminHash);
                int rows = stmt.executeUpdate();
                System.out.println("Updated " + rows + " admin rows.");
            }

            // Update Member/Trainer passwords
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE users SET password = ? WHERE role != 'ADMIN'")) {
                stmt.setString(1, userHash);
                int rows = stmt.executeUpdate();
                System.out.println("Updated " + rows + " non-admin rows.");
            }

            System.out.println("Database passwords successfully fixed using Java JDBC!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
