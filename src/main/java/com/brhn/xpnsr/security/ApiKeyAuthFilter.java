package com.brhn.xpnsr.security;

import com.brhn.xpnsr.models.Application;
import com.brhn.xpnsr.repositories.ApplicationRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Custom authentication filter to authenticate requests based on API key.
 */
@CrossOrigin(origins = "http://localhost:3000") // Allow cross-origin requests from localhost:3000
@Component // Marks this class as a Spring component to be automatically detected and registered
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    @Autowired
    private ApplicationRepository applicationRepository; // Repository to fetch applications by API key

    private static final String API_KEY_HEADER = "XPNSR-API-KEY"; // Header name for API key
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835"; // Example API key for demonstration

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestUri = request.getRequestURI();

        if (requestUri.startsWith("/api/")) { // Check if the request is targeting the API endpoints
            String apiKey = request.getHeader(API_KEY_HEADER); // Retrieve API key from request header

            if (!validateApiKey(apiKey)) { // Validate the API key
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Unauthorized status
                response.setContentType(MediaType.APPLICATION_JSON_VALUE); // Response content type JSON
                response.setCharacterEncoding("UTF-8"); // Response character encoding
                String jsonError = "{\"error\": \"Invalid API key\", " +
                        "\"code\": " + HttpServletResponse.SC_UNAUTHORIZED + "}"; // Error JSON response
                response.getWriter().write(jsonError); // Write error response
                return; // Stop filter chain for unauthorized requests
            }

            authenticateWithApiKey("sample_user", apiKey); // Authenticate the request with the API key
        }

        filterChain.doFilter(request, response); // Continue filter chain for authorized requests
    }

    /**
     * Authenticate the request with the provided API key.
     *
     * @param username The username associated with the API key (typically service account).
     * @param apiKey   The API key used for authentication.
     */
    private void authenticateWithApiKey(String username, String apiKey) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                username, // Principal, using the passed username
                null, // Credentials, not using password for API key auth
                AuthorityUtils.createAuthorityList("ROLE_API_USER") // Authorities
        );

        // Setting the authentication in the SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    /**
     * Validate the provided API key by checking against the ApplicationRepository.
     *
     * @param apiKey The API key to validate.
     * @return true if the API key is valid, false otherwise.
     */
    private boolean validateApiKey(String apiKey) {
        if (StringUtils.isBlank(apiKey)) {
            return false; // Blank API keys are not valid
        }

        Optional<Application> app = applicationRepository.findApplicationByApiKey(apiKey); // Find application by API key
        return app.isPresent(); // Return true if application with API key exists
    }
}