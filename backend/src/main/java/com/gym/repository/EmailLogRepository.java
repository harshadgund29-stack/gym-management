package com.gym.repository;

import com.gym.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * EmailLogRepository — handles database CRUD operations for EmailLog entities.
 */
@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
}
