package com.gym.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * CashfreeConfig — binds all cashfree.* properties from application.properties.
 * Injected into CashfreeService via @Autowired.
 */
@Configuration
public class CashfreeConfig {

    @Value("${cashfree.appId:}")
    private String appId;

    @Value("${cashfree.secretKey:}")
    private String secretKey;

    @Value("${cashfree.environment:SANDBOX}")
    private String environment;

    @Value("${cashfree.apiBaseUrl:https://sandbox.cashfree.com}")
    private String apiBaseUrl;

    @Value("${cashfree.returnUrl:http://localhost:5173/checkout/result}")
    private String returnUrl;

    @Value("${cashfree.notificationUrl:http://localhost:8080/cashfree/callback}")
    private String notificationUrl;

    @Value("${cashfree.webhookSecret:}")
    private String webhookSecret;

    public String getAppId()            { return appId; }
    public String getSecretKey()        { return secretKey; }
    public String getEnvironment()      { return environment; }
    public String getApiBaseUrl()       { return apiBaseUrl; }
    public String getReturnUrl()        { return returnUrl; }
    public String getNotificationUrl()  { return notificationUrl; }
    public String getWebhookSecret()    { return webhookSecret; }

    public boolean isSandbox() {
        return "SANDBOX".equalsIgnoreCase(environment);
    }

    /** Base URL for Cashfree PG API v3 */
    public String getPgApiUrl() {
        return isSandbox()
            ? "https://sandbox.cashfree.com/pg"
            : "https://api.cashfree.com/pg";
    }
}
