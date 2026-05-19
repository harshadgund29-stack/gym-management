package com.gym.controller;

import com.gym.service.CashfreeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * CashfreeController — Cashfree Payment Gateway endpoints.
 *
 * Public endpoints (no JWT required):
 *   POST /cashfree/callback  — webhook called by Cashfree servers after payment
 *
 * Protected endpoints (JWT required):
 *   POST /cashfree/create-order   — member initiates payment
 *   POST /cashfree/verify-order   — member verifies after checkout redirect
 */
@RestController
@RequestMapping("/cashfree")
public class CashfreeController {

    private static final Logger log = LoggerFactory.getLogger(CashfreeController.class);

    @Autowired
    private CashfreeService cashfreeService;

    // ── Create Order ──────────────────────────────────────────

    /**
     * POST /cashfree/create-order
     * Body: { "planId": 1 }
     * Returns: { orderId, paymentSessionId, amount, currency, environment, ... }
     */
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody Map<String, Long> body,
            Principal principal) {

        Long planId = body.get("planId");
        if (planId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "planId is required"));
        }

        Map<String, Object> result = cashfreeService.createOrder(planId, principal.getName());
        return ResponseEntity.ok(result);
    }

    // ── Verify Order ──────────────────────────────────────────

    /**
     * POST /cashfree/verify-order
     * Body: { "paymentId": 1, "cfOrderId": "GYM-1-ABCD1234" }
     * Called by frontend after Cashfree redirects back to return_url.
     */
    @PostMapping("/verify-order")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<Map<String, Object>> verifyOrder(
            @RequestBody Map<String, Object> body,
            Principal principal) {

        Long paymentId  = Long.valueOf(body.get("paymentId").toString());
        String cfOrderId = body.get("cfOrderId").toString();

        Map<String, Object> result = cashfreeService.verifyAndCapture(paymentId, cfOrderId);
        return ResponseEntity.ok(result);
    }

    // ── Webhook (Public) ──────────────────────────────────────

    /**
     * POST /cashfree/callback
     * Called by Cashfree servers when payment status changes.
     * Verifies x-webhook-signature before processing.
     */
    @PostMapping("/callback")
    public ResponseEntity<String> webhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "x-webhook-signature", required = false) String signature,
            @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp) {
        log.info("Cashfree webhook received — signature present: {}", signature != null);
        cashfreeService.handleWebhook(payload, signature, timestamp);
        return ResponseEntity.ok("OK");
    }

    // ── Health Check ──────────────────────────────────────────

    /**
     * GET /cashfree/status
     * Returns current Cashfree config status (sandbox vs production).
     * Admin only.
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
            "configured", true,
            "environment", System.getProperty("cashfree.environment", "SANDBOX"),
            "webhookUrl",  "/cashfree/callback"
        ));
    }
}
