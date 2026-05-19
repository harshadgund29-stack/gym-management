package com.gym.service;

import com.gym.dto.AuthResponse;
import com.gym.dto.LoginRequest;
import com.gym.dto.RegisterRequest;
import com.gym.entity.PasswordResetToken;
import com.gym.entity.Role;
import com.gym.entity.User;
import com.gym.exception.BadRequestException;
import com.gym.repository.PasswordResetTokenRepository;
import com.gym.repository.UserRepository;
import com.gym.security.JwtUtils;
import com.gym.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final String ADMIN_EMAIL = "admin@gmail.com";

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetTokenRepository resetTokenRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // ── Register ─────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN)
            throw new BadRequestException("Admin accounts cannot be self-registered.");

        String email = request.getEmail().trim().toLowerCase();
        request.setEmail(email);

        if (ADMIN_EMAIL.equalsIgnoreCase(email))
            throw new BadRequestException("This email address is reserved.");

        if (userRepository.existsByEmail(email))
            throw new BadRequestException("Email is already registered: " + email);

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.MEMBER);
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        userRepository.save(user);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        logger.info("New user registered: {}", email);
        return buildAuthResponse(jwtUtils.generateToken(auth), user);
    }

    // ── Login ────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword().trim()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        SecurityContextHolder.getContext().setAuthentication(auth);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getRole() == Role.ADMIN && !ADMIN_EMAIL.equalsIgnoreCase(email))
            throw new BadCredentialsException("Invalid email or password");

        logger.info("User logged in: {}", email);
        return buildAuthResponse(jwtUtils.generateToken(auth), user);
    }

    // ── Forgot Password ──────────────────────────────────────

    /**
     * Sends a password-reset email.
     * Always returns success (don't reveal if email exists).
     */
    @Transactional
    public void forgotPassword(String email) {
        String normalised = email.trim().toLowerCase();

        userRepository.findByEmail(normalised).ifPresent(user -> {
            // Delete any existing tokens for this user
            resetTokenRepository.deleteByUserId(user.getId());

            // OTP-based forgot password
            // Generate a 6-digit OTP valid for 5 minutes
            int otp = (int) (Math.random() * 900000) + 100000;
            user.setOtp(otp);
            // re-use generatedTime as "otp generated time"
            user.setGeneratedTime(java.math.BigInteger.valueOf(System.currentTimeMillis()));
            userRepository.save(user);

            // Send OTP email
            emailService.sendOTP(user.getEmail(), otp);

            logger.info("Password reset OTP sent to: {} otp={}", normalised, otp);
        });
    }

    // ── Reset Password ───────────────────────────────────────

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank())
            throw new BadRequestException("Reset token is required.");
        if (newPassword == null || newPassword.length() < 6)
            throw new BadRequestException("Password must be at least 6 characters.");

        PasswordResetToken resetToken = resetTokenRepository
                .findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token."));

        if (LocalDateTime.now().isAfter(resetToken.getExpiresAt()))
            throw new BadRequestException("Reset token has expired. Please request a new one.");

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        logger.info("Password reset successful for: {}", user.getEmail());
    }

    // ── Helper ───────────────────────────────────────────────

    private AuthResponse buildAuthResponse(String token, User user) {
        AuthResponse r = new AuthResponse();
        r.setToken(token);
        r.setTokenType("Bearer");
        r.setUserId(user.getId());
        r.setFirstName(user.getFirstName());
        r.setLastName(user.getLastName());
        r.setEmail(user.getEmail());
        r.setRole(user.getRole());
        return r;
    }
}
