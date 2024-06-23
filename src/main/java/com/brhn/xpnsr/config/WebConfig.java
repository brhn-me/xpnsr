package com.brhn.xpnsr.config;

import com.brhn.xpnsr.converters.TransactionTypeConverter;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final TransactionTypeConverter transactionTypeConverter;

    public WebConfig(TransactionTypeConverter transactionTypeConverter) {
        this.transactionTypeConverter = transactionTypeConverter;
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(transactionTypeConverter);
    }
}
