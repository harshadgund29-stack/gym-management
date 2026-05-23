package com.gym.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.entity.Membership;
import com.gym.entity.Payment;
import com.gym.entity.User;
import com.gym.exception.BadRequestException;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.MembershipPlanRepository;
import com.gym.repository.MembershipRepository;
import com.gym.repository.PaymentRepository;
import com.gym.repository.UserRepository;
import com.gym.service.EmailService;
import com.gym.entity.MembershipPlan;
import com.gym.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/razorpay")
public class RazorpayController {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayController.class);

    @Autowired private PaymentService          paymentService;
    @Autowired private UserRepository           userRepository;
    @Autowired private MembershipPlanRepository planRepository;
    @Autowired private MembershipRepository     membershipRepository;
    @Autowired private PaymentRepository        paymentRepository;
    @Autowired private EmailService             emailService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── 1. Create Razorpay Order ──────────────────────────────────────────────
    @PostMapping("/order")
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) throws RazorpayException {

        if (!body.containsKey("planId")) {
            throw new BadRequestException("planId is required in the request body");
        }
        Long planId;
        try {
            planId = Long.valueOf(body.get("planId").toString());
        } catch (NumberFormatException e) {
            throw new BadRequestException("planId must be a valid numeric ID");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User member = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", planId));

        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new BadRequestException("The selected membership plan is no longer available");
        }

        BigDecimal amount = plan.getPrice().add(plan.getPackingPrice());


        // Generate unique orderId
        String orderId = "RZP-" + System.currentTimeMillis() + "-" + member.getId();
        logger.info("Generated orderId={} for member={} plan={} amount={}",
                orderId, email, plan.getName(), amount);

        // Persist PENDING Membership
        Membership membership = new Membership();
        membership.setMember(member);
        membership.setPlan(plan);
        membership.setStartDate(LocalDate.now());
        membership.setEndDate(LocalDate.now().plusMonths(plan.getDurationMonths()));
        membership.setStatus(Membership.MembershipStatus.PENDING);
        membership = membershipRepository.save(membership);

        // Persist PENDING Payment
        Payment payment = new Payment();
        payment.setMember(member);
        payment.setMembership(membership);
        payment.setAmount(amount);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setPaymentMethod(Payment.PaymentMethod.ONLINE);
        payment.setTransactionId(orderId);
        paymentRepository.save(payment);

        // Call Razorpay API
        int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();
        Order razorpayOrder = paymentService.createRazorpayOrder(amountInPaise, orderId);

        Map<String, Object> response = new HashMap<>();
        response.put("order_id", orderId);
        response.put("razorpay_order_id", razorpayOrder.get("id"));
        response.put("amount", amount);
        response.put("planName", plan.getName());
        response.put("packingPrice", plan.getPackingPrice());
        response.put("totalAmount", amount);
        response.put("memberName", member.getFirstName() + " " + member.getLastName());

        return ResponseEntity.ok(response);
    }

    // ── 2. Verify Razorpay Payment ────────────────────────────────────────────
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> body) throws RazorpayException {
        // order_id      = our internal DB transaction ID (e.g. RZP-1234-5)
        // rzp_order_id  = Razorpay's own order ID (e.g. order_abc123) — used for signature verification
        String internalOrderId  = body.get("order_id");
        String razorpayOrderId  = body.getOrDefault("razorpay_order_id", internalOrderId);
        String paymentId        = body.get("payment_id");
        String signature        = body.get("signature");

        // Verify signature using Razorpay's order ID
        boolean isValid = paymentService.verifyRazorpaySignature(razorpayOrderId, paymentId, signature);

        if (isValid) {
            // Activate membership using our internal order ID
            boolean activated = processSuccessfulPayment(internalOrderId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", activated
                    ? "Payment confirmed and membership activated!"
                    : "Payment was already processed.");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Invalid payment signature!");
        }
    }

    // ── Shared: Activate Payment + Membership ──────────────────────────────────
    @Transactional
    public synchronized boolean processSuccessfulPayment(String orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(orderId);
        if (paymentOpt.isEmpty()) {
            logger.error("processSuccessfulPayment: no payment found for orderId={}", orderId);
            return false;
        }

        Payment payment = paymentOpt.get();

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            logger.info("processSuccessfulPayment: orderId={} already COMPLETED — skipping", orderId);
            return false;
        }

        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentMethod(Payment.PaymentMethod.ONLINE);
        paymentRepository.save(payment);

        Membership membership = payment.getMembership();
        membership.setStatus(Membership.MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        User member = payment.getMember();
        try {
            emailService.sendPaymentReceipt(
                    member.getEmail(),
                    member.getFirstName() + " " + member.getLastName(),
                    membership.getPlan().getName(),
                    payment.getAmount(),
                    payment.getTransactionId(),
                    membership.getEndDate().toString());
        } catch (Exception e) {
            logger.error("Failed to send payment receipt to {}: {}", member.getEmail(), e.getMessage());
        }

        return true;
    }
}
