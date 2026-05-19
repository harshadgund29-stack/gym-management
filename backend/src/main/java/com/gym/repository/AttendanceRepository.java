package com.gym.repository;

import com.gym.entity.Attendance;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    /** All attendance records for a specific user, newest first */
    List<Attendance> findByUserOrderByDateDescCheckInTimeDesc(User user);

    /** Today's record for a specific user (for toggle check-in/out) */
    Optional<Attendance> findByUserAndDate(User user, LocalDate date);

    /** All records for a specific date (admin/trainer today view) */
    List<Attendance> findByDateOrderByCheckInTimeDesc(LocalDate date);

    /** Count total check-ins for a user */
    long countByUser(User user);
}
