package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.repositories.ApplicationRepository;
import com.brhn.xpnsr.repositories.TransactionRepository;
import com.brhn.xpnsr.services.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ReportsApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";

    @BeforeEach
    public void setUp() {
    }

    @Test
    public void testGetMonthlyExpenseReport() throws Exception {
        mockMvc.perform(get("/api/reports/monthly-groceries")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetMonthlyEarningReport() throws Exception {
        mockMvc.perform(get("/api/reports/monthly-salary")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetYearlyTravelReport() throws Exception {
        mockMvc.perform(get("/api/reports/yearly-travel")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
