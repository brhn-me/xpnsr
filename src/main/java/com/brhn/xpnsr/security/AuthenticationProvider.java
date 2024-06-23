package com.brhn.xpnsr.security;

import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Component responsible for providing authentication-related utility methods.
 */
@Component
public class AuthenticationProvider {

    /**
     * Retrieves the username of the currently authenticated user.
     *
     * @return Username of the authenticated user, or null if no user is authenticated.
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // No user authenticated
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // Return username from UserDetails
        } else if (principal instanceof String) {
            return (String) principal; // Return username as String
        }
        return null; // Principal is neither UserDetails nor String
    }

    /**
     * Configures a BCryptPasswordEncoder bean for password hashing.
     *
     * @return BCryptPasswordEncoder instance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Return BCryptPasswordEncoder bean
    }
}
