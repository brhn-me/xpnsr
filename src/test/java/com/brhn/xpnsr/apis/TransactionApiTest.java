package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.models.Application;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.models.TransactionType;
import com.brhn.xpnsr.repositories.ApplicationRepository;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.services.TransactionService;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TransactionApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    private TransactionDTO transactionDTO;
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    @BeforeEach
    public void setUp() {

        // Setup sample TransactionDTO
        transactionDTO = new TransactionDTO();
        transactionDTO.setId(1L);
        transactionDTO.setDate(new Timestamp(Instant.now().toEpochMilli()));
        transactionDTO.setType(TransactionType.EXPENSE);
        transactionDTO.setAmount(BigDecimal.valueOf(100.00));
        transactionDTO.setCurrency("USD");
        transactionDTO.setPrimaryCategoryId("groceries");
        transactionDTO.setDescription("Grocery shopping");
    }

    @Test
    public void testAddTransaction() throws Exception {
        String jsonContent = String.format("{\"date\": \"%s\", \"type\": \"EXPENSE\", \"amount\": 100.00, \"currency\": \"USD\", \"primaryCategoryId\": \"groceries\", \"description\": \"Grocery shopping\"}", dateFormat.format(new Date(transactionDTO.getDate().getTime())));

        mockMvc.perform(post("/api/transactions/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.primaryCategoryId").value("groceries"))
                .andExpect(jsonPath("$.description").value("Grocery shopping"));
    }

    @Test
    public void testUpdateTransaction() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);
        String jsonContent = String.format("{\"date\": \"%s\", \"type\": \"EXPENSE\", \"amount\": 150.00, \"currency\": \"USD\", \"primaryCategoryId\": \"travel\", \"description\": \"Updated description\"}", dateFormat.format(new Date(createdTransaction.getDate().getTime())));

        mockMvc.perform(put("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.amount").value(150.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.primaryCategoryId").value("travel"))
                .andExpect(jsonPath("$.description").value("Updated description"));
    }

    @Test
    public void testGetTransactionById() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(get("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.primaryCategoryId").value("groceries"))
                .andExpect(jsonPath("$.description").value("Grocery shopping"));
    }

    @Test
    public void testGetAllTransactions() throws Exception {
        transactionService.add(transactionDTO);

        mockMvc.perform(get("/api/transactions/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type").value("EXPENSE"))
                .andExpect(jsonPath("$.content[0].amount").value(100.00))
                .andExpect(jsonPath("$.content[0].currency").value("USD"))
                .andExpect(jsonPath("$.content[0].primaryCategoryId").value("groceries"))
                .andExpect(jsonPath("$.content[0].description").value("Grocery shopping"));
    }

    @Test
    public void testDeleteTransaction() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(delete("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY))
                .andExpect(status().isNoContent());
    }
}