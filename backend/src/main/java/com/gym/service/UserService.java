package com.gym.service;

import com.gym.dto.*;
import java.util.List;

/**
 * UserService — business logic contract for user management.
 * Implemented by com.gym.service.impl.UserServiceImpl.
 */
public interface UserService {

    // ── CRUD ──────────────────────────────────────────────────
    UsersResponseDto addUser(UsersRequestDto requestDto);
    List<UsersResponseDto> getAllUsers();
    UsersResponseDto getUserById(Long userId);
    UsersResponseDto updateUser(Long userId, UsersRequestDto requestDto);
    String deleteUser(Long userId);

    // ── Auth / Login ──────────────────────────────────────────
    LoginResponseDto loginUser(String email, String password);

    // ── Password flows ────────────────────────────────────────
    String forgotPassword(String email);
    String verifyOtp(VerifyOtpDto dto);
    String resetPassword(ResetPasswordDto dto);
    void changePassword(String email, ChangePasswordRequest req);

    // ── Profile ───────────────────────────────────────────────
    UsersResponseDto getProfile(String email);
    UsersResponseDto updateProfile(String email, UsersRequestDto requestDto);

    // ── Admin ─────────────────────────────────────────────────
    UsersResponseDto addUserByAdmin(AdminUserRequestDto requestDto);
}
