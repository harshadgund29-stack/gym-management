package com.gym.service;

import com.gym.dto.CreatePaymentRequest;
import com.gym.dto.PaymentDTO;
import com.gym.entity.Membership;
import com.gym.entity.MembershipPlan;
import com.gym.entity.Payment;
import com.gym.entity.User;
import com.gym.exception.BadRequestException;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.MembershipPlanRepository;
import com.gym.repository.MembershipRepository;
import com.gym.repository.PaymentRepository;
import com.gym.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MembershipRepository membershipRepository;
    @Autowired private MembershipPlanRepository planRepository;

    /** GET /api/payments — all payments (Admin) */
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** GET /api/payments/my — own payments (Member) */
    public List<PaymentDTO> getMyPayments(String email) {
        User member = findUserByEmail(email);
        return paymentRepository.findByMemberOrderByPaymentDateDesc(member)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** GET /api/payments/member/{id} — payments by member ID (Admin/Member) */
    public List<PaymentDTO> getPaymentsByMember(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));
        return paymentRepository.findByMemberOrderByPaymentDateDesc(member)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** GET /api/payments/revenue — revenue stats (Admin) */
    public Map<String, Object> getRevenue() {
        BigDecimal total = paymentRepository.getTotalRevenue();
        long count = paymentRepository.count();
        long thisMonth = paymentRepository.countPaymentsThisMonth();
        return Map.of(
                "totalRevenue", total != null ? total : BigDecimal.ZERO,
                "totalPayments", count,
                "paymentsThisMonth", thisMonth
        );
    }

    /** POST /api/payments — Admin manual payment creation */
    @Transactional
    public PaymentDTO createPayment(CreatePaymentRequest request) {
        User member = userRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getMemberId()));
        Membership membership = membershipRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", request.getMembershipId()));

        Payment payment = new Payment();
        payment.setMember(member);
        payment.setMembership(membership);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(request.getTransactionId());
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        return toDTO(paymentRepository.save(payment));
    }

    /**
     * POST /api/payments/paypal/create-order
     * Creates a pending payment record and returns a PayPal order ID.
     * The actual PayPal order is created on the frontend via @paypal/react-paypal-js.
     */
    @Transactional
    public Map<String, Object> createPayPalOrder(Long planId, String email) {
        User member = findUserByEmail(email);
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", "id", planId));

        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new BadRequestException("This membership plan is no longer available.");
        }

        // Create a pending membership
        Membership membership = new Membership();
        membership.setMember(member);
        membership.setPlan(plan);
        membership.setStartDate(LocalDate.now());
        membership.setEndDate(LocalDate.now().plusMonths(plan.getDurationMonths()));
        membership.setStatus(Membership.MembershipStatus.PENDING);
        membershipRepository.save(membership);

        // Create a pending payment record
        Payment payment = new Payment();
        payment.setMember(member);
        payment.setMembership(membership);
        payment.setAmount(plan.getPrice());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setPaymentMethod(Payment.PaymentMethod.ONLINE);
        paymentRepository.save(payment);

        logger.info("PayPal order initiated for planId={} email={}", planId, email);

        // Return plan details so frontend PayPal SDK can create the order
        return Map.of(
                "paymentId", payment.getId(),
                "planName", plan.getName(),
                "amount", plan.getPrice().toPlainString(),
                "currency", "USD"
        );
    }

    /**
     * POST /api/payments/paypal/capture-order
     * Called after PayPal payment is approved on the frontend.
     * Marks the payment as COMPLETED and activates the membership.
     */
    @Transactional
    public PaymentDTO capturePayPalOrder(Long paymentId, String paypalOrderId, String email) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            return toDTO(payment); // idempotent
        }

        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setTransactionId(paypalOrderId);
        paymentRepository.save(payment);

        Membership membership = payment.getMembership();
        if (membership != null) {
            membership.setStatus(Membership.MembershipStatus.ACTIVE);
            membershipRepository.save(membership);
        }

        logger.info("PayPal payment COMPLETED paymentId={} orderId={} email={}", paymentId, paypalOrderId, email);
        return toDTO(payment);
    }

    // ── Helpers ──────────────────────────────────────────────

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private PaymentDTO toDTO(Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        if (p.getMember() != null) {
            dto.setMemberId(p.getMember().getId());
            dto.setMemberName(p.getMember().getFirstName() + " " + p.getMember().getLastName());
        }
        if (p.getMembership() != null) {
            dto.setMembershipId(p.getMembership().getId());
            if (p.getMembership().getPlan() != null) {
                dto.setPlanName(p.getMembership().getPlan().getName());
            }
        }
        dto.setAmount(p.getAmount());
        dto.setStatus(p.getStatus());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setTransactionId(p.getTransactionId());
        dto.setPaymentDate(p.getPaymentDate());
        return dto;
    }
}
