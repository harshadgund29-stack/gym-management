package com.gym.service.impl;

import com.gym.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * EmailServiceImpl — synchronous email sending via Gmail SMTP.
 *
 * NO @Async — failures surface immediately in logs and HTTP responses.
 * Logs "About to send OTP to {}" immediately before mailSender.send().
 * Catches MailException, logs full stacktrace, rethrows so caller sees the failure.
 * helper.setFrom() always equals spring.mail.username.
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    /** Must equal spring.mail.username — Gmail rejects mismatched From headers */
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String smtpHost;

    @Value("${spring.mail.port:587}")
    private int smtpPort;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String mailHost() {
        return smtpHost;
    }

    private int mailPort() {
        return smtpPort;
    }

    // ── OTP Email ─────────────────────────────────────────────

    @Override
    public void sendOTP(String toEmail, int otp) {
        log.info("[EMAIL] sendOTP called — to={} from={}", toEmail, fromEmail);
        log.info("[EMAIL] SMTP config host={} port={} debug=true", mailHost(), mailPort());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // From must match spring.mail.username exactly
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your OTP Code");

            // Keep body as plain text
            String html = "Your OTP is " + otp + ". It expires in 5 minutes.";
            helper.setText(html, false);

            log.info("[EMAIL] About to send OTP to {} via SMTP host {}:{}", toEmail, mailHost(), mailPort());
            mailSender.send(message);
            log.info("[EMAIL] OTP email delivered successfully to {}", toEmail);

        } catch (MailException e) {
            log.error("[EMAIL] SMTP MailException sending OTP to {} — {}", toEmail, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("[EMAIL] Unexpected error sending OTP to {} — {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP email to " + toEmail, e);
        }
    }

    // ── Password Reset Link Email ─────────────────────────────

    @Override
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetLink) {
        log.info("[EMAIL] sendPasswordResetEmail called — to={} from={}", toEmail, fromEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password — FitPro Gym");

            String safeName = (firstName == null || firstName.isBlank()) ? "Member" : escapeHtml(firstName);
            String safeLink = escapeHtml(resetLink);

            String html =
                "<div style='font-family:Arial,sans-serif;max-width:520px;margin:auto;" +
                "background:#f9f9f9;border-radius:8px;padding:32px;border:1px solid #e0e0e0'>" +
                "<h2 style='color:#004D4D;margin-top:0'>FitPro Gym Management</h2>" +
                "<p style='color:#333'>Hi <strong>" + safeName + "</strong>,</p>" +
                "<p style='color:#333'>Click the button below to reset your password:</p>" +
                "<div style='text-align:center;margin:32px 0'>" +
                "<a href='" + safeLink + "' style='display:inline-block;padding:14px 32px;" +
                "background:#e8445a;color:#fff;text-decoration:none;border-radius:6px;" +
                "font-weight:bold;font-size:16px'>Reset Password</a></div>" +
                "<p style='color:#555'>This link expires in <strong>1 hour</strong>.</p>" +
                "<hr style='border:none;border-top:1px solid #e0e0e0;margin:24px 0'/>" +
                "<small style='color:#999'>FitPro Gym — automated message</small>" +
                "</div>";

            helper.setText(html, true);

            log.info("[EMAIL] About to send password-reset email to {} via SMTP host {}:{}", toEmail, mailHost(), mailPort());
            mailSender.send(message);
            log.info("[EMAIL] Password-reset email delivered successfully to {}", toEmail);

        } catch (MailException e) {
            log.error("[EMAIL] SMTP MailException sending reset email to {} — {}", toEmail, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("[EMAIL] Unexpected error sending reset email to {} — {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send password-reset email to " + toEmail, e);
        }
    }

    // ── HTML escape ───────────────────────────────────────────

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
            .replace("&",  "&amp;")
            .replace("<",  "&lt;")
            .replace(">",  "&gt;")
            .replace("\"", "&quot;")
            .replace("'",  "&#x27;");
    }
}

