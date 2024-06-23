package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.services.TransactionService;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the Transaction API.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TransactionApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private PagedResourcesAssembler<TransactionDTO> pagedResourcesAssembler;

    private TransactionDTO transactionDTO;
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";

    @BeforeEach
    public void setUp() {
        // Setup sample transactionDTO
        transactionDTO = new TransactionDTO();
        transactionDTO.setId(1L);
        transactionDTO.setDate(Timestamp.valueOf("2024-06-20 12:34:56"));
        transactionDTO.setType(com.brhn.xpnsr.models.TransactionType.EXPENSE);
        transactionDTO.setAmount(BigDecimal.valueOf(100.00));
        transactionDTO.setDue(BigDecimal.ZERO);
        transactionDTO.setTitle("Grocery Shopping");
        transactionDTO.setCurrency("USD");
        transactionDTO.setCity("New York");
        transactionDTO.setCountry("USA");
        transactionDTO.setDescription("Bought groceries from supermarket");
        transactionDTO.setTags("grocery, food");
        transactionDTO.setPrimaryCategoryId("groceries");
    }

    /**
     * Test the creation of a new transaction.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateTransaction() throws Exception {
        mockMvc.perform(post("/api/transactions/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"2024-06-20T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 100.00, \"due\": 0.00, \"title\": \"Grocery Shopping\", \"currency\": \"USD\", \"city\": \"New York\", \"country\": \"USA\", \"description\": \"Bought groceries from supermarket\", \"tags\": \"grocery, food\", \"primaryCategoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Grocery Shopping"))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.primaryCategoryId").value("groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test creating a transaction with invalid input.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateTransactionInvalidInput() throws Exception {
        mockMvc.perform(post("/api/transactions/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"\", \"type\": \"\", \"amount\": -100.00, \"due\": -10.00, \"title\": \"\", \"currency\": \"\", \"city\": \"\", \"country\": \"\", \"description\": \"\", \"tags\": \"\", \"primaryCategoryId\": \"\", \"secondaryCategoryId\": \"\", \"userId\": 1}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test updating an existing transaction.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateTransaction() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(put("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"2024-06-21T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 150.00," +
                                " \"due\": 0.00, \"title\": \"Restaurant Bill\", \"currency\": \"USD\", \"city\": " +
                                "\"Los Angeles\", \"country\": \"USA\", \"description\": \"Dinner at a restaurant\", " +
                                "\"tags\": \"dinner, restaurant\", \"primaryCategoryId\": \"travel\", \"userId\": 1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test updating a non-existing transaction.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateTransactionNotFound() throws Exception {
        mockMvc.perform(put("/api/transactions/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"2024-06-21T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 150.00, \"due\": 0.00, \"title\": \"Restaurant Bill\", \"currency\": \"USD\", \"city\": \"Los Angeles\", \"country\": \"USA\", \"description\": \"Dinner at a restaurant\", \"tags\": \"dinner, restaurant\", \"primaryCategoryId\": \"dining\", \"userId\": 1}"))
                .andExpect(status().isNotFound());
    }

    /**
     * Test retrieving a transaction by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetTransactionById() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(get("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Grocery Shopping"))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.primaryCategoryId").value("groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test retrieving a non-existing transaction by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetTransactionByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/transactions/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    /**
     * Test retrieving all transactions.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllTransactions() throws Exception {
        transactionService.add(transactionDTO);

        Pageable pageable = PageRequest.of(0, 5);
        Page<TransactionDTO> page = new PageImpl<>(Collections.singletonList(transactionDTO), pageable, 1);

        mockMvc.perform(get("/api/transactions/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].title").value("Grocery Shopping"))
                .andExpect(jsonPath("$.items[0].amount").value(100.00))
                .andExpect(jsonPath("$.items[0].primaryCategoryId").value("groceries"))
                .andExpect(jsonPath("$.items[0]._links.self.href").exists())
                .andExpect(jsonPath("$.items[0]._links.edit.href").exists())
                .andExpect(jsonPath("$.items[0]._links.delete.href").exists());
    }

    /**
     * Test deleting a transaction.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteTransaction() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(delete("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY))
                .andExpect(status().isOk());
    }

    /**
     * Test deleting a non-existing transaction.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteTransactionNotFound() throws Exception {
        mockMvc.perform(delete("/api/transactions/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY))
                .andExpect(status().isNotFound());
    }

    /**
     * Test creating a transaction with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateTransactionInvalidApiKey() throws Exception {
        mockMvc.perform(post("/api/transactions/")
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"2024-06-20T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 100.00, \"due\": 0.00, \"title\": \"Grocery Shopping\", \"currency\": \"USD\", \"city\": \"New York\", \"country\": \"USA\", \"description\": \"Bought groceries from supermarket\", \"tags\": \"grocery, food\", \"primaryCategoryId\": \"groceries\", \"secondaryCategoryId\": \"food\", \"userId\": 1}"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test updating a transaction with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateTransactionInvalidApiKey() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(put("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"2024-06-21T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 150.00, \"due\": 0.00, \"title\": \"Restaurant Bill\", \"currency\": \"USD\", \"city\": \"Los Angeles\", \"country\": \"USA\", \"description\": \"Dinner at a restaurant\", \"tags\": \"dinner, restaurant\", \"primaryCategoryId\": \"dining\", \"userId\": 1}"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test deleting a transaction with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteTransactionInvalidApiKey() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(delete("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, "invalid_api_key"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving a transaction with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetTransactionByIdInvalidApiKey() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(get("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all transactions with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllTransactionsInvalidApiKey() throws Exception {
        transactionService.add(transactionDTO);

        mockMvc.perform(get("/api/transactions/")
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all transactions with pagination and sorting.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllTransactionsPaginationAndSorting() throws Exception {
        // Create multiple transactions for testing pagination
        for (int i = 0; i < 10; i++) {
            TransactionDTO transaction = new TransactionDTO();
            transaction.setDate(Timestamp.valueOf("2024-06-20 12:34:56"));
            transaction.setType(com.brhn.xpnsr.models.TransactionType.EXPENSE);
            transaction.setAmount(BigDecimal.valueOf(100.00 + i));
            transaction.setDue(BigDecimal.ZERO);
            transaction.setTitle("Grocery Shopping " + i);
            transaction.setCurrency("USD");
            transaction.setCity("New York");
            transaction.setCountry("USA");
            transaction.setDescription("Bought groceries from supermarket");
            transaction.setTags("grocery, food");
            transaction.setPrimaryCategoryId("groceries");
            transactionService.add(transaction);
        }

        mockMvc.perform(get("/api/transactions/?page=0&size=5&sort=amount,desc")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(5));
    }

    /**
     * Test creating a transaction with validation errors.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateTransactionValidationErrors() throws Exception {
        // Invalid amount
        mockMvc.perform(post("/api/transactions/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"2024-06-20T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": -100.00, \"due\": 0.00, \"title\": \"Grocery Shopping\", \"currency\": \"USD\", \"city\": \"New York\", \"country\": \"USA\", \"description\": \"Bought groceries from supermarket\", \"tags\": \"grocery, food\", \"primaryCategoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isBadRequest());

        // Missing primary category
        mockMvc.perform(post("/api/transactions/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"date\": \"2024-06-20T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 100.00, \"due\": 0.00, \"title\": \"Grocery Shopping\", \"currency\": \"USD\", \"city\": \"New York\", \"country\": \"USA\", \"description\": \"Bought groceries from supermarket\", \"tags\": \"grocery, food\", \"userId\": 1}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test retrieving a transaction by ID with hypermedia links.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetTransactionByIdHypermediaLinks() throws Exception {
        TransactionDTO createdTransaction = transactionService.add(transactionDTO);

        mockMvc.perform(get("/api/transactions/" + createdTransaction.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Grocery Shopping"))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.primaryCategoryId").value("groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }
}
