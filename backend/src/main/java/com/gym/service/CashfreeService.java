package com.gym.service;

import com.gym.config.CashfreeConfig;
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
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * CashfreeService — integrates with Cashfree Payment Gateway (PG API v3).
 *
 * Flow:
 *   1. createOrder()  → POST /pg/orders → returns order_id + payment_session_id
 *   2. Frontend opens Cashfree checkout using payment_session_id
 *   3. Cashfree calls /cashfree/callback (webhook) on payment completion
 *   4. handleWebhook() verifies and marks payment COMPLETED
 *
 * Sandbox docs: https://docs.cashfree.com/docs/payment-gateway
 */
@Service
public class CashfreeService {

    private static final Logger log = LoggerFactory.getLogger(CashfreeService.class);

    @Autowired private CashfreeConfig config;
    @Autowired private UserRepository userRepository;
    @Autowired private MembershipPlanRepository planRepository;
    @Autowired private MembershipRepository membershipRepository;
    @Autowired private PaymentRepository paymentRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Create Cashfree Order ─────────────────────────────────

    /**
     * Creates a Cashfree order for the given plan and returns the
     * order_id + payment_session_id needed by the frontend SDK.
     */
    @Transactional
    public Map<String, Object> createOrder(Long planId, String email) {
        User member = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", "id", planId));

        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new BadRequestException("This membership plan is no longer available.");
        }

        // Create a PENDING membership
        Membership membership = new Membership();
        membership.setMember(member);
        membership.setPlan(plan);
        membership.setStartDate(LocalDate.now());
        membership.setEndDate(LocalDate.now().plusMonths(plan.getDurationMonths()));
        membership.setStatus(Membership.MembershipStatus.PENDING);
        membershipRepository.save(membership);

        // Create a PENDING payment record
        Payment payment = new Payment();
        payment.setMember(member);
        payment.setMembership(membership);
        payment.setAmount(plan.getPrice());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setPaymentMethod(Payment.PaymentMethod.ONLINE);
        paymentRepository.save(payment);

        // Build unique order ID
        String orderId = "GYM-" + payment.getId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        payment.setTransactionId(orderId);
        paymentRepository.save(payment);

        // Call Cashfree API
        Map<String, Object> cashfreeResponse = callCashfreeCreateOrder(orderId, plan, member);

        log.info("Cashfree order created: orderId={} planId={} email={}", orderId, planId, email);

        // Return everything the frontend needs
        Map<String, Object> result = new HashMap<>();
        result.put("paymentId",        payment.getId());
        result.put("orderId",          orderId);
        result.put("planName",         plan.getName());
        result.put("amount",           plan.getPrice().toPlainString());
        result.put("currency",         "INR");
        result.put("environment",      config.getEnvironment());
        // payment_session_id from Cashfree — used by frontend @cashfreepayments/cashfree-js
        result.put("paymentSessionId", cashfreeResponse.getOrDefault("payment_session_id", ""));
        result.put("cfOrderId",        cashfreeResponse.getOrDefault("cf_order_id", ""));
        return result;
    }

    // ── Verify & Capture ─────────────────────────────────────

    /**
     * Called after frontend payment completes.
     * Verifies the order status with Cashfree and marks payment COMPLETED.
     */
    @Transactional
    public Map<String, Object> verifyAndCapture(Long paymentId, String cfOrderId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            return Map.of("status", "ALREADY_COMPLETED", "paymentId", paymentId);
        }

        // Verify with Cashfree
        String orderStatus = getOrderStatus(cfOrderId);
        log.info("Cashfree order {} status: {}", cfOrderId, orderStatus);

        if ("PAID".equalsIgnoreCase(orderStatus)) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            paymentRepository.save(payment);

            Membership membership = payment.getMembership();
            if (membership != null) {
                membership.setStatus(Membership.MembershipStatus.ACTIVE);
                membershipRepository.save(membership);
            }
            log.info("Payment {} marked COMPLETED via Cashfree verify", paymentId);
            return Map.of("status", "COMPLETED", "paymentId", paymentId);
        }

        return Map.of("status", orderStatus, "paymentId", paymentId);
    }

    // ── Webhook Handler ───────────────────────────────────────

    /**
     * Handles Cashfree webhook POST to /cashfree/callback.
     * Verifies the x-webhook-signature header before processing.
     * See: https://docs.cashfree.com/docs/webhook-verification
     */
    @Transactional
    public void handleWebhook(Map<String, Object> payload, String signatureHeader, String timestampHeader) {
        // Verify signature if webhookSecret is configured
        if (config.getWebhookSecret() != null && !config.getWebhookSecret().isBlank()) {
            if (!verifyWebhookSignature(payload, signatureHeader, timestampHeader)) {
                log.warn("[WEBHOOK] Signature verification FAILED — rejecting payload");
                throw new com.gym.exception.BadRequestException("Invalid webhook signature");
            }
            log.info("[WEBHOOK] Signature verified OK");
        } else {
            log.warn("[WEBHOOK] webhookSecret not configured — skipping signature verification (set cashfree.webhookSecret in production)");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> orderData = (Map<String, Object>) payload.get("order");
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentData = (Map<String, Object>) payload.get("payment");

            if (orderData == null || paymentData == null) {
                log.warn("Cashfree webhook: missing order or payment data in payload");
                return;
            }

            String orderId       = (String) orderData.get("order_id");
            String orderStatus   = (String) orderData.get("order_status");
            String paymentStatus = (String) paymentData.get("payment_status");

            log.info("Cashfree webhook: orderId={} orderStatus={} paymentStatus={}",
                    orderId, orderStatus, paymentStatus);

            if ("PAID".equalsIgnoreCase(orderStatus) || "SUCCESS".equalsIgnoreCase(paymentStatus)) {
                paymentRepository.findByTransactionId(orderId).ifPresent(payment -> {
                    if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
                        payment.setStatus(Payment.PaymentStatus.COMPLETED);
                        paymentRepository.save(payment);

                        Membership membership = payment.getMembership();
                        if (membership != null) {
                            membership.setStatus(Membership.MembershipStatus.ACTIVE);
                            membershipRepository.save(membership);
                        }
                        log.info("Webhook: payment {} activated for orderId={}", payment.getId(), orderId);
                    }
                });
            }
        } catch (com.gym.exception.BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error processing Cashfree webhook: {}", e.getMessage(), e);
        }
    }

    /**
     * Verify Cashfree webhook HMAC-SHA256 signature.
     * Cashfree signs: timestamp + rawBody using the webhook secret.
     */
    private boolean verifyWebhookSignature(Map<String, Object> payload, String signatureHeader, String timestampHeader) {
        try {
            if (signatureHeader == null || timestampHeader == null) {
                log.warn("[WEBHOOK] Missing signature or timestamp header");
                return false;
            }
            String rawBody = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
            String dataToSign = timestampHeader + rawBody;

            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(
                    config.getWebhookSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] hmac = mac.doFinal(dataToSign.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String computed = java.util.Base64.getEncoder().encodeToString(hmac);
            return computed.equals(signatureHeader);
        } catch (Exception e) {
            log.error("[WEBHOOK] Signature verification error: {}", e.getMessage(), e);
            return false;
        }
    }

    // ── Private Helpers ───────────────────────────────────────

    /** POST /pg/orders — create a Cashfree order */
    @SuppressWarnings("unchecked")
    private Map<String, Object> callCashfreeCreateOrder(String orderId, MembershipPlan plan, User member) {
        String url = config.getPgApiUrl() + "/orders";

        Map<String, Object> body = new HashMap<>();
        body.put("order_id",       orderId);
        body.put("order_amount",   plan.getPrice().doubleValue());
        body.put("order_currency", "INR");
        body.put("order_note",     "Gym membership: " + plan.getName());

        Map<String, String> customerDetails = new HashMap<>();
        customerDetails.put("customer_id",    "CUST-" + member.getId());
        customerDetails.put("customer_name",  member.getFirstName() + " " + member.getLastName());
        customerDetails.put("customer_email", member.getEmail());
        customerDetails.put("customer_phone", member.getPhone() != null ? member.getPhone() : "9999999999");
        body.put("customer_details", customerDetails);

        Map<String, String> orderMeta = new HashMap<>();
        orderMeta.put("return_url",       config.getReturnUrl() + "?order_id={order_id}");
        orderMeta.put("notify_url",       config.getNotificationUrl());
        body.put("order_meta", orderMeta);

        HttpHeaders headers = buildHeaders();
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Cashfree createOrder non-2xx: {}", response.getStatusCode());
            return Map.of("error", "Cashfree API returned " + response.getStatusCode());
        } catch (Exception e) {
            log.error("Cashfree createOrder failed: {}", e.getMessage(), e);
            // Return empty map — frontend will handle gracefully
            return Map.of("error", e.getMessage());
        }
    }

    /** GET /pg/orders/{orderId} — fetch order status */
    @SuppressWarnings("unchecked")
    private String getOrderStatus(String orderId) {
        String url = config.getPgApiUrl() + "/orders/" + orderId;
        HttpHeaders headers = buildHeaders();
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().getOrDefault("order_status", "UNKNOWN");
            }
        } catch (Exception e) {
            log.error("Cashfree getOrderStatus failed for {}: {}", orderId, e.getMessage());
        }
        return "UNKNOWN";
    }

    /** Build Cashfree API request headers (v3) */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id",     config.getAppId());
        headers.set("x-client-secret", config.getSecretKey());
        headers.set("x-api-version",   "2023-08-01");
        return headers;
    }
}
