package com.gym.controller;

import com.gym.dto.CreatePaymentRequest;
import com.gym.dto.PaymentDTO;
import com.gym.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PaymentController
 * Base URL: /api/payments
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /** GET /api/payments — Admin only */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /** GET /api/payments/member/{memberId} — Admin or the member themselves */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(paymentService.getPaymentsByMember(memberId));
    }

    /** GET /api/payments/revenue — Admin only: view revenue statistics */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueStats() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", paymentService.getTotalRevenue());
        return ResponseEntity.ok(response);
    }

    /** POST /api/payments — Admin only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentDTO> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(request));
    }

    // ============================
    // Razorpay Integration Endpoints
    // ============================

    /** POST /api/payments/create-order — Create Razorpay order */
    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestParam int amount,
                                                 @RequestParam String receiptId) {
        try {
            Order order = paymentService.createRazorpayOrder(amount, receiptId);
            return ResponseEntity.ok(order.toString());
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating Razorpay order: " + e.getMessage());
        }
    }

    /** POST /api/payments/verify-payment — Verify Razorpay payment signature */
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyRazorpayPayment(@RequestParam String orderId,
                                                   @RequestParam String paymentId,
                                                   @RequestParam String signature) {
        try {
            boolean isValid = paymentService.verifyRazorpaySignature(orderId, paymentId, signature);
            Map<String, Object> response = new HashMap<>();
            response.put("validSignature", isValid);
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying Razorpay payment: " + e.getMessage());
        }
    }
}
