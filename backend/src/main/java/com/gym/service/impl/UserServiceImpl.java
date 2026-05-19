package com.gym.service.impl;

import com.gym.dto.*;
import com.gym.entity.Role;
import com.gym.entity.User;
import com.gym.entity.Vendor;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repo.VendorRepository;
import com.gym.repository.UserRepository;
import com.gym.security.JwtUtils;
import com.gym.service.EmailService;
import com.gym.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.List;
import java.util.Random;

/**
 * UserServiceImpl
 *
 * OTP rules: 6-digit, 5-minute expiry, single-use (cleared after verify or reset).
 * Passwords: always BCrypt.
 * Email: sent in daemon thread so HTTP response returns immediately.
 *        Failures are logged with full stacktrace by EmailServiceImpl.
 */
@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired private JwtUtils         jwtUtils;
    @Autowired private UserRepository   userRepository;
    @Autowired private VendorRepository vendorRepository;
    @Autowired private PasswordEncoder  passwordEncoder;
    @Autowired private EmailService     emailService;

    // ── CRUD ──────────────────────────────────────────────────

    @Override
    @Transactional
    public UsersResponseDto addUser(UsersRequestDto requestDto) {
        User user = new User();
        String[] parts = splitName(requestDto.getName());
        user.setFirstName(parts[0]);
        user.setLastName(parts[1]);
        user.setEmail(requestDto.getEmail());
        user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        user.setRole(parseRole(requestDto.getRole(), Role.MEMBER));
        return toDto(userRepository.save(user));
    }

    @Override
    public List<UsersResponseDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    public UsersResponseDto getUserById(Long userId) {
        return toDto(findById(userId));
    }

    @Override
    @Transactional
    public UsersResponseDto updateUser(Long userId, UsersRequestDto requestDto) {
        User user = findById(userId);
        if (requestDto.getName() != null) {
            String[] parts = splitName(requestDto.getName());
            user.setFirstName(parts[0]);
            user.setLastName(parts[1]);
        }
        if (requestDto.getEmail() != null) user.setEmail(requestDto.getEmail());
        if (requestDto.getRole()  != null) user.setRole(parseRole(requestDto.getRole(), user.getRole()));
        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public String deleteUser(Long userId) {
        userRepository.delete(findById(userId));
        return "User deleted successfully";
    }

    // ── Login ─────────────────────────────────────────────────

    @Override
    public LoginResponseDto loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        Long vId = null;
        Vendor vendor = vendorRepository.findByUser_Email(email).orElse(null);
        if (vendor != null) vId = vendor.getVId();

        return new LoginResponseDto(token, user.getRole().name(), user.getEmail(), user.getId(), vId);
    }

    // ── OTP Forgot-Password Flow ──────────────────────────────

    @Override
    @Transactional
    public String forgotPassword(String email) {
        log.info("[forgotPassword] Request received for: {}", email);

        String normalised = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalised)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // Generate 6-digit OTP and persist
        int otp = generateOTP();
        user.setOtp(otp);
        user.setGeneratedTime(BigInteger.valueOf(System.currentTimeMillis()));
        userRepository.save(user);
        log.info("[forgotPassword] OTP generated and saved for: {}", normalised);

        // Send email in a daemon thread so HTTP response returns immediately.
        // SMTP can take several seconds — blocking the request thread causes client timeouts.
        // Failures are logged by EmailServiceImpl with full stacktrace.
        final String emailFinal = normalised;
        final int otpFinal = otp;
        Thread emailThread = new Thread(() -> {
            try {
                log.info("[forgotPassword] Email thread started for: {}", emailFinal);
                emailService.sendOTP(emailFinal, otpFinal);
                log.info("[forgotPassword] Email thread completed — OTP sent to: {}", emailFinal);
            } catch (Exception ex) {
                log.error("[forgotPassword] Email thread FAILED for: {} — {}", emailFinal, ex.getMessage(), ex);
            }
        }, "otp-email-" + normalised);
        emailThread.setDaemon(true);
        emailThread.start();

        return "OTP Sent Successfully";
    }

    @Override
    public String verifyOtp(VerifyOtpDto dto) {
        log.info("[verifyOtp] Attempt for: {}", dto.getEmail());

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getEmail()));

        if (user.getOtp() == null) {
            throw new IllegalStateException("OTP not generated. Please request a new one.");
        }

        long elapsed = System.currentTimeMillis()
                - (user.getGeneratedTime() != null ? user.getGeneratedTime().longValue() : 0L);

        if (elapsed > 5 * 60 * 1000L) {
            throw new IllegalStateException("OTP expired. Please request a new one.");
        }

        if (!user.getOtp().equals(dto.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP.");
        }

        log.info("[verifyOtp] OTP verified for: {}", dto.getEmail());
        return "OTP verified successfully";
    }

    @Override
    @Transactional
    public String resetPassword(ResetPasswordDto dto) {
        log.info("[resetPassword] Attempt for: {}", dto.getEmail());

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getEmail()));

        // Validate OTP session is still active (5-minute window)
        if (user.getGeneratedTime() == null) {
            throw new IllegalStateException("No active OTP session. Please request a new OTP.");
        }

        long elapsed = System.currentTimeMillis() - user.getGeneratedTime().longValue();
        if (elapsed > 5 * 60 * 1000L) {
            throw new IllegalStateException("OTP session expired. Please request a new OTP.");
        }

        // Reset password with BCrypt
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        // Clear OTP session — single-use
        user.setOtp(null);
        user.setGeneratedTime(null);
        userRepository.save(user);

        log.info("[resetPassword] Password reset successfully for: {}", dto.getEmail());
        return "Password reset successfully";
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        log.info("[changePassword] Password changed for: {}", email);
    }

    // ── Profile ───────────────────────────────────────────────

    @Override
    public UsersResponseDto getProfile(String email) {
        return toDto(userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email)));
    }

    @Override
    @Transactional
    public UsersResponseDto updateProfile(String email, UsersRequestDto requestDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (requestDto.getName() != null) {
            String[] parts = splitName(requestDto.getName());
            user.setFirstName(parts[0]);
            user.setLastName(parts[1]);
        }
        if (requestDto.getEmail() != null) user.setEmail(requestDto.getEmail());
        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }
        return toDto(userRepository.save(user));
    }

    // ── Admin ─────────────────────────────────────────────────

    @Override
    @Transactional
    public UsersResponseDto addUserByAdmin(AdminUserRequestDto requestDto) {
        User user = new User();
        String[] parts = splitName(requestDto.getName());
        user.setFirstName(parts[0]);
        user.setLastName(parts[1]);
        user.setEmail(requestDto.getEmail());
        user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        user.setRole(parseRole(requestDto.getRole(), Role.MEMBER));
        return toDto(userRepository.save(user));
    }

    // ── Private helpers ───────────────────────────────────────

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private UsersResponseDto toDto(User user) {
        UsersResponseDto dto = new UsersResponseDto();
        dto.setId(user.getId());
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        dto.setName(name.isEmpty() ? user.getEmail() : name);
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        return dto;
    }

    private int generateOTP() {
        return 100000 + new Random().nextInt(900000);
    }

    private String[] splitName(String name) {
        if (name == null || name.isBlank()) return new String[]{"", ""};
        int idx = name.indexOf(' ');
        if (idx < 0) return new String[]{name.trim(), ""};
        return new String[]{name.substring(0, idx).trim(), name.substring(idx + 1).trim()};
    }

    private Role parseRole(String roleStr, Role defaultRole) {
        if (roleStr == null || roleStr.isBlank()) return defaultRole;
        try {
            return Role.valueOf(roleStr.toUpperCase().replace("ROLE_", ""));
        } catch (IllegalArgumentException e) {
            return defaultRole;
        }
    }
}
