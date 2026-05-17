package com.gym.repository;

import com.gym.entity.Role;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository — Spring Data JPA automatically implements all CRUD methods.
 * We only need to declare custom query methods here.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during login to look up a user by email
    Optional<User> findByEmail(String email);

    // Check if an email is already registered (used during registration)
    boolean existsByEmail(String email);

    // Admin: get all users with a specific role
    List<User> findByRole(Role role);
}
