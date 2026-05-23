package com.gym.repository;

import com.gym.entity.Payment;
import com.gym.entity.Payment.PaymentStatus;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByMemberOrderByPaymentDateDesc(User member);

    Optional<Payment> findByTransactionId(String transactionId);

    // ✅ Fixed: reference the field name "status" instead of full package path
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(p) FROM Payment p WHERE MONTH(p.paymentDate) = MONTH(CURRENT_DATE) AND YEAR(p.paymentDate) = YEAR(CURRENT_DATE)")
    long countPaymentsThisMonth();

    // ✅ Fixed: same correction for month/year query
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = 'COMPLETED' AND MONTH(p.paymentDate) = :month AND YEAR(p.paymentDate) = :year")
    BigDecimal getRevenueByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // 🔒 Alternative safer version (type-safe enum parameter)
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalRevenueByStatus(@Param("status") PaymentStatus status);
}
