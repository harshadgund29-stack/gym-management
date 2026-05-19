package com.gym;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;

/**
 * EmailIntegrationTest — live SMTP test against Gmail.
 *
 * HOW TO RUN (one-time manual test):
 *   1. Ensure application-dev.properties has the correct App Password
 *   2. Remove the @Disabled annotation below
 *   3. Run: mvn test -Dtest=EmailIntegrationTest -Dspring.profiles.active=dev
 *   4. Check harshadgund29@gmail.com inbox (also check Spam folder)
 *
 * Re-add @Disabled after confirming email works so it doesn't run on every build.
 */
@SpringBootTest
@ActiveProfiles("dev")
@org.junit.jupiter.api.Disabled("Remove this line to run the live email test")
class EmailIntegrationTest {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private com.gym.service.EmailService emailService;

    /** Test 1: SimpleMailMessage (plain text) */
    @Test
    void testSimpleEmail() {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom("harshadgund29@gmail.com");
        msg.setTo("harshadgund29@gmail.com");
        msg.setSubject("[FitPro] Manual Email Test — SimpleMailMessage");
        msg.setText(
            "Email integration is working!\n\n"
          + "Sender : harshadgund29@gmail.com\n"
          + "Method : SimpleMailMessage\n"
          + "Time   : " + java.time.LocalDateTime.now()
        );

        mailSender.send(msg);
        System.out.println("✅ SimpleMailMessage sent successfully");
    }

    /** Test 2: HTML password-reset email via EmailService */
    @Test
    void testPasswordResetEmail() {
        emailService.sendPasswordResetEmail(
            "harshadgund29@gmail.com",
            "Harshad",
            "http://localhost:5173/reset-password?token=test-token-12345"
        );
        System.out.println("✅ Password-reset HTML email sent successfully");
    }
}
