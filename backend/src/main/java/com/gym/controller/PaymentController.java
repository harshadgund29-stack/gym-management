package com.gym.controller;

import com.gym.dto.CreatePaymentRequest;
import com.gym.dto.PaymentDTO;
import com.gym.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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

    /** GET /api/payments — Admin only: all payments */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /** GET /api/payments/my — logged-in member's own payments */
    @GetMapping("/my")
    public ResponseEntity<List<PaymentDTO>> getMyPayments(Principal principal) {
        return ResponseEntity.ok(paymentService.getMyPayments(principal.getName()));
    }

    /** GET /api/payments/member/{memberId} — Admin or the member themselves */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(paymentService.getPaymentsByMember(memberId));
    }

    /** GET /api/payments/revenue — Admin only: revenue stats */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRevenue() {
        return ResponseEntity.ok(paymentService.getRevenue());
    }

    /** POST /api/payments — Admin only: manual payment creation */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentDTO> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(request));
    }

    /**
     * POST /api/payments/paypal/create-order
     * Member initiates a PayPal payment for a plan.
     * Returns amount + paymentId so frontend PayPal SDK can open the payment popup.
     */
    @PostMapping("/paypal/create-order")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<Map<String, Object>> createPayPalOrder(
            @RequestBody Map<String, Long> body,
            Principal principal) {
        Long planId = body.get("planId");
        return ResponseEntity.ok(paymentService.createPayPalOrder(planId, principal.getName()));
    }

    /**
     * POST /api/payments/paypal/capture-order
     * Called after PayPal approves the payment on the frontend.
     * Marks payment COMPLETED and activates the membership.
     */
    @PostMapping("/paypal/capture-order")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<PaymentDTO> capturePayPalOrder(
            @RequestBody Map<String, Object> body,
            Principal principal) {
        Long paymentId = Long.valueOf(body.get("paymentId").toString());
        String orderId  = body.get("orderId").toString();
        return ResponseEntity.ok(
                paymentService.capturePayPalOrder(paymentId, orderId, principal.getName()));
    }
}
