package com.brhn.xpnsr.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.victools.jsonschema.generator.*;
import org.springframework.stereotype.Component;

@Component
public class SchemaGeneratorUtil {

    private final SchemaGenerator schemaGenerator;

    public SchemaGeneratorUtil() {
        SchemaGeneratorConfigBuilder configBuilder = new SchemaGeneratorConfigBuilder(SchemaVersion.DRAFT_2020_12, OptionPreset.PLAIN_JSON);
        SchemaGeneratorConfig config = configBuilder.build();
        this.schemaGenerator = new SchemaGenerator(config);
    }

    public String generateSchema(Class<?> clazz) {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonSchema = schemaGenerator.generateSchema(clazz);
        return jsonSchema.toPrettyString();
    }
}
