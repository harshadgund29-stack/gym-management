package com.gym.repository;

import com.gym.entity.Attendance;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUserOrderByCheckInDesc(User user);

    long countByUser(User user);

    Optional<Attendance> findTopByUserAndCheckOutIsNullOrderByCheckInDesc(User user);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.user WHERE a.checkIn >= :start AND a.checkIn <= :end ORDER BY a.checkIn DESC")
    List<Attendance> findByCheckInBetweenOrderByCheckInDesc(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.checkIn >= :start AND a.checkIn <= :end")
    long countTodayCheckIns(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.checkIn >= :start AND a.checkIn <= :end AND a.checkOut IS NULL")
    long countActiveToday(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.checkIn >= :start AND a.checkIn <= :end AND a.status = 'COMPLETED'")
    long countCompletedToday(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
