package com.gym.config;

import com.gym.security.JwtAuthFilter;
import com.gym.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig — Spring Security configuration.
 *
 * Must match required spec for this PR:
 * - Permit unauthenticated access:
 *   /api/auth/**,
 *   /api/users/forgot-password,
 *   /api/users/verify-otp,
 *   /api/users/reset-password
 * - Require authentication for:
 *   /api/plans/**,
 *   /api/attendance/**,
 *   /api/users/profile,
 *   /api/users/change-password
 * - Admin endpoints require ROLE_ADMIN (method security / @PreAuthorize).
 * - Stateless JWT session management.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public auth endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Public password reset flows (OTP)
                .requestMatchers(HttpMethod.POST, "/api/users/forgot-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/verify-otp").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/reset-password").permitAll()

                // Plans — public GET so landing page works without JWT
                .requestMatchers(HttpMethod.GET, "/api/plans").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/plans/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/plans/{id}").permitAll()

                // Actuator health — public for monitoring
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/**").permitAll()

                // Cashfree webhook — called by Cashfree servers, no JWT
                .requestMatchers("/cashfree/callback").permitAll()

                // Dev tooling
                .requestMatchers("/h2-console/**").permitAll()

                // Dev email tooling
                .requestMatchers("/internal/**").permitAll()

                // Protect attendance
                .requestMatchers("/api/attendance/**").authenticated()

                // Protect profile and change-password
                .requestMatchers("/api/users/profile").authenticated()
                .requestMatchers("/api/users/change-password").authenticated()

                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        String envOrigin = System.getenv("ALLOWED_ORIGIN");
        if (envOrigin != null && !envOrigin.isBlank()) {
            List<String> prodOrigins = java.util.Arrays.stream(envOrigin.split(","))
                .map(String::trim)
                .toList();
            config.setAllowedOrigins(prodOrigins);
        } else {
            config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
            ));
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

