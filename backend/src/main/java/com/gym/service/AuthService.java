package com.gym.service;

import com.gym.dto.AuthResponse;
import com.gym.dto.LoginRequest;
import com.gym.dto.RegisterRequest;
import com.gym.entity.Role;
import com.gym.entity.User;
import com.gym.exception.BadRequestException;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.UserRepository;
import com.gym.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService — handles user registration and login.
 *
 * Admin login rules:
 *  - Only admin@gmail.com can log in as ADMIN.
 *  - No one can self-register as ADMIN.
 *  - Members and Trainers can register and log in normally.
 */
@Service
public class AuthService {

    private static final String ADMIN_EMAIL = "admin@gmail.com";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    /**
     * Register a new user.
     * Rules:
     *  - ADMIN role cannot be self-registered.
     *  - Email must not already be taken.
     *  - Password is BCrypt-hashed before storage.
     */
    public AuthResponse register(RegisterRequest request) {
        // Block self-registration as ADMIN
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be self-registered.");
        }

        // Normalize email
        String email = request.getEmail().trim().toLowerCase();
        request.setEmail(email);

        // Block using the admin email for non-admin registration
        if (ADMIN_EMAIL.equalsIgnoreCase(email)) {
            throw new BadRequestException("This email address is reserved.");
        }

        // Check for duplicate email
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        // Build the User entity
        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        userRepository.save(user);

        // Authenticate immediately so we can generate a token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtils.generateToken(authentication);

        return buildAuthResponse(token, user);
    }

    /**
     * Login an existing user.
     *
     * Admin login rule: only admin@gmail.com is allowed to log in as ADMIN.
     * If any other account somehow has ADMIN role, login is blocked.
     */
    public AuthResponse login(LoginRequest request) {
        // Normalize email
        String email = request.getEmail().trim().toLowerCase();

        // Authenticate via Spring Security (BCrypt password check)
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword().trim())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Load the user to check role
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Enforce: only admin@gmail.com can be ADMIN
        if (user.getRole() == Role.ADMIN && !ADMIN_EMAIL.equalsIgnoreCase(email)) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(authentication);
        return buildAuthResponse(token, user);
    }

    /**
     * Initiates the forgot-password flow: generates a 6-digit OTP, saves it, and sends it via SMTP.
     */
    public void forgotPassword(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizedEmail));
        
        String otp = otpService.generateOtp(normalizedEmail);
        emailService.sendOtpEmail(normalizedEmail, otp);
    }

    /**
     * Verifies if the supplied OTP matches the cache and is not expired.
     */
    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();
        if (!userRepository.existsByEmail(normalizedEmail)) {
            throw new ResourceNotFoundException("User", "email", normalizedEmail);
        }
        return otpService.verifyOtp(normalizedEmail, otp);
    }

    /**
     * Verifies the OTP, hashes the new password with BCrypt, updates the user record, and clears OTP cache.
     */
    public void resetPassword(com.gym.dto.ResetPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizedEmail));
        
        if (!otpService.verifyOtp(normalizedEmail, request.getOtp())) {
            throw new BadRequestException("Invalid or expired OTP code.");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);
        otpService.clearOtp(normalizedEmail);
    }

    /** Helper to build the AuthResponse DTO */
    private AuthResponse buildAuthResponse(String token, User user) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setTokenType("Bearer");
        response.setUserId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }
}

