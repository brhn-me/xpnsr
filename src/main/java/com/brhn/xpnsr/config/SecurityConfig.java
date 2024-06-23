package com.brhn.xpnsr.config;

import com.brhn.xpnsr.security.ApiKeyAuthFilter;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ApiKeyAuthFilter apiKeyAuthFilter;

    @Autowired
    public SecurityConfig(ApiKeyAuthFilter apiKeyAuthFilter) {
        this.apiKeyAuthFilter = apiKeyAuthFilter;
    }

    /**
     * Configures the security filter chain for HTTP requests.
     *
     * @param http HttpSecurity object to configure security settings
     * @return SecurityFilterChain instance
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF protection

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/**").permitAll() // Permit all requests by default
                )
                .addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter.class); // Add custom API key filter

        return http.build(); // Build and return the configured SecurityFilterChain
    }

    /**
     * Configures custom OpenAPI documentation for the API.
     *
     * @return OpenAPI instance with custom documentation
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("XPNSR API")
                        .version("Version: 1")
                        .description("API Description\n\n" +
                                "**API Authentication**\n" +
                                "All requests to the API endpoints under `/api/` require authentication via an API key. " +
                                "You must include this API key in the request header as follows:\n\n" +
                                "- **Header Name**: `XPNSR-API-KEY`\n" +
                                "- **Sample API Key for Testing**: `c779c66a194f4ddfbc22a9e2dacb5835`"))
                .addSecurityItem(new SecurityRequirement().addList("api_key"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("api_key", new SecurityScheme()
                                .name("XPNSR-API-KEY") // Header name used by your API
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .description("Enter API key here. " +
                                        "[SAMPLE TEST KEY: c779c66a194f4ddfbc22a9e2dacb5835 ]")));
    }
}