package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.services.dtos.BillDTO;
import com.brhn.xpnsr.utils.JsonSchemaGenerator;
import com.brhn.xpnsr.utils.TestSchemaGenerator;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class SchemaApiTest {

    private SchemaApi schemaApi;
    private MockMvc mockMvc;
    private JsonNode mockSchema;

    @BeforeEach
    public void setUp() throws Exception {
        JsonSchemaGenerator testSchemaGenerator = new TestSchemaGenerator();
        schemaApi = new SchemaApi(testSchemaGenerator);
        mockMvc = MockMvcBuilders.standaloneSetup(schemaApi).build();

        mockSchema = testSchemaGenerator.generateSchema(BillDTO.class);
    }

    @Test
    public void testGetBillSchema() throws Exception {
        mockMvc.perform(get("/api/schemas/bill")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(mockSchema.toPrettyString()));
    }

    @Test
    public void testGetBudgetSchema() throws Exception {
        mockMvc.perform(get("/api/schemas/budget")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(mockSchema.toPrettyString()));
    }

    @Test
    public void testGetCategorySchema() throws Exception {
        mockMvc.perform(get("/api/schemas/category")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(mockSchema.toPrettyString()));
    }

    @Test
    public void testGetTransactionSchema() throws Exception {
        mockMvc.perform(get("/api/schemas/transaction")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(mockSchema.toPrettyString()));
    }

    @Test
    public void testGetUserSchema() throws Exception {
        mockMvc.perform(get("/api/schemas/user")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(mockSchema.toPrettyString()));
    }
}
