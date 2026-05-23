package com.gym.service;

import com.gym.dto.ChangePasswordRequest;
import com.gym.dto.UpdateProfileRequest;
import com.gym.dto.UserDTO;
import com.gym.entity.Role;
import com.gym.entity.User;
import com.gym.exception.BadRequestException;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * UserService — business logic for user management.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    /** Forgot password: generate and save OTP */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Generate random 6-digit OTP
        int otp = (int)(Math.random() * 900000) + 100000;

        // Save OTP and timestamp in DB
        user.setOtp(otp);
        user.setOtpGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        // Send OTP via email
        emailService.sendOtp(user.getEmail(), otp);
    }

    /** Verify OTP */
    public boolean verifyOtp(String email, int otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getOtp() == null) {
            return false;
        }

        // Check expiry (5 minutes)
        if (user.getOtpGeneratedAt() != null &&
            user.getOtpGeneratedAt().plusMinutes(5).isBefore(LocalDateTime.now())) {
            return false; // expired
        }

        return user.getOtp().equals(otp);
    }

    /** Reset password after OTP verification */
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null); // clear OTP after use
        user.setOtpGeneratedAt(null);
        userRepository.save(user);
    }

    /** Get all users (admin only) */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Get all members */
    public List<UserDTO> getAllMembers() {
        return userRepository.findByRole(Role.MEMBER).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Get all trainers */
    public List<UserDTO> getAllTrainers() {
        return userRepository.findByRole(Role.TRAINER).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Get a single user by ID */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toDTO(user);
    }

    /** Get the currently logged-in user's profile */
    public UserDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toDTO(user);
    }

    /** Update a user's own profile */
    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        return toDTO(userRepository.save(user));
    }

    /** Admin: delete a user */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    /** Change the logged-in user's password */
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /** Convert User entity → UserDTO (never expose the password) */
    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
