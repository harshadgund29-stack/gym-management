package com.gym.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

/**
 * MailConnectionChecker — runs once at startup.
 *
 * Calls JavaMailSenderImpl.testConnection() to verify SMTP credentials
 * and connectivity. Logs success or failure clearly so the operator
 * knows immediately whether email will work before any request arrives.
 *
 * A failed SMTP connection does NOT prevent the app from starting —
 * it only logs a warning so other features remain available.
 */
@Component
public class MailConnectionChecker implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MailConnectionChecker.class);

    @Autowired
    private JavaMailSenderImpl mailSender;

    @Override
    public void run(ApplicationArguments args) {
        log.info("[MAIL] Checking SMTP connection to {}:{} as {}",
                mailSender.getHost(),
                mailSender.getPort(),
                mailSender.getUsername());
        try {
            mailSender.testConnection();
            log.info("[MAIL] SMTP connection OK — host={} port={} user={}",
                    mailSender.getHost(),
                    mailSender.getPort(),
                    mailSender.getUsername());
        } catch (Exception e) {
            log.warn("[MAIL] SMTP connection FAILED at startup — email sending will not work. " +
                     "host={} port={} user={} error={}",
                    mailSender.getHost(),
                    mailSender.getPort(),
                    mailSender.getUsername(),
                    e.getMessage());
            log.debug("[MAIL] SMTP connection failure detail:", e);
        }
    }
}
