package com.gym.repository;

import com.gym.entity.Payment;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByMemberOrderByPaymentDateDesc(User member);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(p) FROM Payment p WHERE MONTH(p.paymentDate) = MONTH(CURRENT_DATE) AND YEAR(p.paymentDate) = YEAR(CURRENT_DATE)")
    long countPaymentsThisMonth();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' AND MONTH(p.paymentDate) = :month AND YEAR(p.paymentDate) = :year")
    BigDecimal getRevenueByMonthAndYear(@Param("month") int month, @Param("year") int year);
}
