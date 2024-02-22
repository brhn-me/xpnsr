package com.brhn.xpnsr;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@OpenAPIDefinition(
        servers = {
                @Server(url = "/", description = "XPNSR API")
        }
)
@SpringBootApplication
public class XpnsrApplication {

    public static void main(String[] args) {
        SpringApplication.run(XpnsrApplication.class, args);
    }

}
