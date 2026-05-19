package com.gym.repository;

import com.gym.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /** Find a valid (unused) token by its string value */
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);

    /** Find any token by string value (used or unused) */
    Optional<PasswordResetToken> findByToken(String token);

    /** Delete all tokens belonging to a specific user (before issuing a new one) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken t WHERE t.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
