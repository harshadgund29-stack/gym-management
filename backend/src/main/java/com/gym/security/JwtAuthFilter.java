package com.gym.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthFilter — runs once per request.
 *
 * Flow:
 *   1. Extract the JWT from the "Authorization: Bearer <token>" header
 *   2. Validate the token
 *   3. Load the user from the database
 *   4. Set the authentication in Spring Security's context
 *
 * After this filter, Spring Security knows who the user is and what roles they have.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Step 1: Get the JWT from the request header
            String jwt = parseJwt(request);

            // Step 2: Validate the token
            if (jwt != null && jwtUtils.validateToken(jwt)) {

                // Step 3: Get the email from the token
                String email = jwtUtils.getEmailFromToken(jwt);

                // Step 4: Load user details from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Step 5: Create an authentication object and set it in the security context
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()  // roles
                        );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // This tells Spring Security the user is authenticated for this request
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        // Continue to the next filter in the chain
        filterChain.doFilter(request, response);
    }

    /** Extract the token from "Authorization: Bearer <token>" */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // remove "Bearer " prefix
        }
        return null;
    }
}
