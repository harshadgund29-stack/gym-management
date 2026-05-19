package com.gym.controller;

import com.gym.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * MailTestController — TEMPORARY dev-only endpoint to isolate SMTP issues.
 *
 * Only active in the "dev" profile. Remove or disable before production deploy.
 *
 * Endpoints:
 *   GET /internal/test-email              — sends a test OTP to spring.mail.username
 *   GET /internal/test-email?to=other@x   — sends to a custom address
 *   GET /internal/smtp-status             — shows SMTP config (no secrets)
 */
@RestController
@RequestMapping("/internal")
@Profile("dev")   // only active when spring.profiles.active=dev
public class MailTestController {

    private static final Logger log = LoggerFactory.getLogger(MailTestController.class);

    @Autowired private EmailService        emailService;
    @Autowired private JavaMailSenderImpl  mailSender;

    @Value("${spring.mail.username}")
    private String defaultTo;

    /** Send a test OTP email to verify SMTP end-to-end */
    @GetMapping("/test-email")
    public Map<String, Object> testEmail(
            @RequestParam(required = false) String to) {

        String recipient = (to != null && !to.isBlank()) ? to : defaultTo;
        log.info("[MAIL-TEST] Sending test OTP to {}", recipient);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("recipient", recipient);
        result.put("smtpHost",  mailSender.getHost());
        result.put("smtpPort",  mailSender.getPort());
        result.put("smtpUser",  mailSender.getUsername());

        try {
            emailService.sendOTP(recipient, 123456);
            result.put("status",  "SUCCESS");
            result.put("message", "Test OTP (123456) sent to " + recipient);
            log.info("[MAIL-TEST] SUCCESS — test OTP sent to {}", recipient);
        } catch (Exception e) {
            result.put("status",  "FAILED");
            result.put("error",   e.getMessage());
            log.error("[MAIL-TEST] FAILED sending to {} — {}", recipient, e.getMessage(), e);
        }
        return result;
    }

    /** Show SMTP config for debugging (no password exposed) */
    @GetMapping("/smtp-status")
    public Map<String, Object> smtpStatus() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("host",     mailSender.getHost());
        info.put("port",     mailSender.getPort());
        info.put("username", mailSender.getUsername());
        info.put("protocol", mailSender.getProtocol());
        info.put("note",     "Password not shown. Check application-dev.properties.");

        try {
            mailSender.testConnection();
            info.put("connectionTest", "OK");
        } catch (Exception e) {
            info.put("connectionTest", "FAILED: " + e.getMessage());
        }
        return info;
    }
}
