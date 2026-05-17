package com.gym.entity;

/**
 * Enum representing the three roles in the system.
 * - ADMIN: Full access to manage everything
 * - TRAINER: Can manage their assigned members and sessions
 * - MEMBER: Can view their own data and profile
 */
public enum Role {
    ADMIN,
    TRAINER,
    MEMBER
}
