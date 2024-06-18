package com.brhn.xpnsr.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    /**
     * Configures a grouped OpenAPI specification for the public API endpoints.
     *
     * @return GroupedOpenApi instance for Version 1 API
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi
                .builder()
                .group("Version 1") // Group name for the API
                .pathsToMatch("/api/**") // Paths to include in this group (all under /api/)
                .build();
    }
}
