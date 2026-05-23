package com.gym.service;

import com.gym.entity.EmailLog;
import com.gym.exception.BadGatewayException;
import com.gym.repository.EmailLogRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Year;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    /** Sends a 6-digit OTP to the user for password reset. */
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "FitPro Gym — Password Reset Code";
        String html    = buildOtpHtml(otp);

        try {
            sendHtml(toEmail, subject, html);
            persistLog(toEmail, subject, html, "SUCCESS", null);
            logger.info("OTP email delivered to: {}", toEmail);
        } catch (Exception e) {
            persistLog(toEmail, subject, html, "FAILED", e.getMessage());
            logger.error("OTP email FAILED for: {} — {}", toEmail, e.getMessage(), e);
            throw new BadGatewayException(
                "Could not deliver OTP email. Check SMTP credentials in application.properties.", e);
        }
    }

    /** Overloaded method: Sends OTP when provided as an int. */
    public void sendOtp(String toEmail, int otp) {
        sendOtpEmail(toEmail, String.valueOf(otp));
    }

    /** Sends a payment receipt after a successful transaction. */
    public void sendPaymentReceipt(String toEmail, String memberName, String planName,
                                   BigDecimal amount, String transactionId, String endDate) {
        String subject = "FitPro Gym — Payment Receipt: " + planName;
        String html    = buildReceiptHtml(memberName, planName, amount, transactionId, endDate);

        try {
            sendHtml(toEmail, subject, html);
            persistLog(toEmail, subject, html, "SUCCESS", null);
            logger.info("Payment receipt delivered to: {}", toEmail);
        } catch (Exception e) {
            persistLog(toEmail, subject, html, "FAILED", e.getMessage());
            logger.error("Payment receipt FAILED for: {} — {}", toEmail, e.getMessage(), e);
            // Non-blocking: don’t throw, just log
        }
    }

    /** Sends an admin notification (e.g. new member registered). */
    public void sendAdminNotification(String toEmail, String subject, String bodyText) {
        String html = buildSimpleHtml(subject, bodyText);
        try {
            sendHtml(toEmail, subject, html);
            persistLog(toEmail, subject, html, "SUCCESS", null);
            logger.info("Admin notification delivered to: {}", toEmail);
        } catch (Exception e) {
            persistLog(toEmail, subject, html, "FAILED", e.getMessage());
            logger.warn("Admin notification FAILED for: {} — {}", toEmail, e.getMessage());
        }
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private void sendHtml(String toEmail, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    private void persistLog(String recipient, String subject, String body,
                             String status, String errorMessage) {
        try {
            EmailLog log = new EmailLog();
            log.setRecipient(recipient);
            log.setSubject(subject);
            log.setBody(body);
            log.setStatus(status);
            log.setErrorMessage(errorMessage);
            emailLogRepository.save(log);
        } catch (Exception dbEx) {
            logger.error("Could not persist email log to DB: {}", dbEx.getMessage(), dbEx);
        }
    }

    // ---------------------------------------------------------------
    // HTML template builders
    // ---------------------------------------------------------------

    private String buildOtpHtml(String otp) {
        int year = Year.now().getValue();
        return "<!DOCTYPE html><html><body>"
            + "<h3>Password Reset Code</h3>"
            + "<p>Your OTP is: <strong>" + otp + "</strong></p>"
            + "<p>&copy; " + year + " FitPro Gym</p>"
            + "</body></html>";
    }

    private String buildReceiptHtml(String memberName, String planName,
                                    BigDecimal amount, String transactionId, String endDate) {
        int year = Year.now().getValue();
        return "<!DOCTYPE html><html><body>"
            + "<h3>Payment Successful!</h3>"
            + "<p>Hi " + memberName + ",</p>"
            + "<p>You purchased the plan: <strong>" + planName + "</strong></p>"
            + "<p>Amount Paid: &#8377;" + amount + "</p>"
            + "<p>Transaction ID: " + transactionId + "</p>"
            + "<p>Valid Until: " + endDate + "</p>"
            + "<p>&copy; " + year + " FitPro Gym</p>"
            + "</body></html>";
    }

    private String buildSimpleHtml(String title, String bodyText) {
        int year = Year.now().getValue();
        return "<!DOCTYPE html><html><body>"
            + "<h3>" + title + "</h3>"
            + "<p>" + bodyText + "</p>"
            + "<p>&copy; " + year + " FitPro Gym</p>"
            + "</body></html>";
    }
}
