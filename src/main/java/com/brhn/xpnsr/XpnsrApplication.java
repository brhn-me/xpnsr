package com.brhn.xpnsr;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point of the XPNSR application.
 */
@OpenAPIDefinition(
        servers = {
                @Server(url = "/", description = "XPNSR API")
        }
)
@SpringBootApplication
public class XpnsrApplication {

    /**
     * Main method to start the XPNSR Spring Boot application.
     *
     * @param args Command-line arguments passed to the application.
     */
    public static void main(String[] args) {
        SpringApplication.run(XpnsrApplication.class, args);
    }

}
