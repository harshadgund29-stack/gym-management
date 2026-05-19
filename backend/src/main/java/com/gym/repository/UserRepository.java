package com.gym.repository;

import com.gym.entity.Role;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository — Spring Data JPA repository for the User entity.
 *
 * Note: findByRoleIgnoreCase(String) cannot be auto-derived for an enum field.
 * We implement it via JPQL using UPPER() comparison so the spec contract is met.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Spec-required: filter by role string, case-insensitive.
     * Uses JPQL to convert the string param to uppercase and compare with
     * the stored enum name (which is always uppercase in the DB).
     */
    @Query("SELECT u FROM User u WHERE UPPER(u.role) = UPPER(:role)")
    List<User> findByRoleIgnoreCase(@Param("role") String role);

    /** Convenience: filter by Role enum — used by DashboardService */
    List<User> findByRole(Role role);
}
