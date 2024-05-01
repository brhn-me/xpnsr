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

@CrossOrigin(origins = "http://localhost:3000")
@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    @Autowired
    private ApplicationRepository applicationRepository;

    private static final String API_KEY_HEADER = "XPNSR-API-KEY";
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestUri = request.getRequestURI();

        if (requestUri.startsWith("/api/")) {
            String apiKey = request.getHeader(API_KEY_HEADER);

            if (!validateApiKey(apiKey)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                String jsonError = "{\"error\": \"Invalid API key\", " +
                        "\"code\": " + HttpServletResponse.SC_UNAUTHORIZED + "}";
                response.getWriter().write(jsonError);
                // stop filter chain for unauthorized /api/ requests
                return;
            }
            authenticateWithApiKey("sample_user", apiKey);
        }
        filterChain.doFilter(request, response);
    }

    private void authenticateWithApiKey(String username, String apiKey) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                username, // Principal, using the passed username
                null, // Credentials, not using password for API key auth
                AuthorityUtils.createAuthorityList("ROLE_API_USER") // Authorities
        );

        // Setting the authentication in the SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private boolean validateApiKey(String apiKey) {
        if (StringUtils.isBlank(apiKey)) {
            return false;
        }

        Optional<Application> app = applicationRepository.findApplicationByApiKey(apiKey);
        return app.isPresent();
    }
}
