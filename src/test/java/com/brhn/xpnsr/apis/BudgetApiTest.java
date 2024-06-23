package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.services.BudgetService;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the Budget API.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class BudgetApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BudgetService budgetService;

    private BudgetDTO budgetDTO;
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";

    @BeforeEach
    public void setUp() {
        // Setup sample budgetDTO
        budgetDTO = new BudgetDTO();
        budgetDTO.setId(1L);
        budgetDTO.setTitle("Monthly Groceries");
        budgetDTO.setAmount(BigDecimal.valueOf(500.00));
        budgetDTO.setCurrency("USD");
        budgetDTO.setCategoryId("groceries");
        budgetDTO.setUserId(1L);
    }

    /**
     * Test the creation of a new budget.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBudget() throws Exception {
        mockMvc.perform(post("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Groceries\", \"amount\": 500.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Monthly Groceries"))
                .andExpect(jsonPath("$.amount").value(500.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.categoryId").value("groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test creating a budget with invalid input.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBudgetInvalidInput() throws Exception {
        mockMvc.perform(post("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"\", \"amount\": -500.00, \"currency\": \"\", \"categoryId\": \"\", \"userId\": null}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test updating an existing budget.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateBudget() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(put("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Groceries\", \"amount\": 600.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Monthly Groceries"))
                .andExpect(jsonPath("$.amount").value(600.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.categoryId").value("groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test updating a non-existing budget.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateBudgetNotFound() throws Exception {
        mockMvc.perform(put("/api/budgets/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Groceries\", \"amount\": 600.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isNotFound());
    }

    /**
     * Test retrieving a budget by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBudgetById() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(get("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Monthly Groceries"))
                .andExpect(jsonPath("$.amount").value(500.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.categoryId").value("groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test retrieving a non-existing budget by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBudgetByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/budgets/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    /**
     * Test retrieving all budgets.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllBudgets() throws Exception {
        budgetService.add(budgetDTO);

        mockMvc.perform(get("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].title").value("Monthly Groceries"))
                .andExpect(jsonPath("$.items[0].amount").value(500.00))
                .andExpect(jsonPath("$.items[0].currency").value("USD"))
                .andExpect(jsonPath("$.items[0].categoryId").value("groceries"))
                .andExpect(jsonPath("$.items[0]._links.self.href").exists())
                .andExpect(jsonPath("$.items[0]._links.edit.href").exists())
                .andExpect(jsonPath("$.items[0]._links.delete.href").exists());
    }

    /**
     * Test deleting a budget.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteBudget() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(delete("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY))
                .andExpect(status().isOk());
    }

    /**
     * Test deleting a non-existing budget.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteBudgetNotFound() throws Exception {
        mockMvc.perform(delete("/api/budgets/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY))
                .andExpect(status().isNotFound());
    }

    /**
     * Test creating a budget with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBudgetInvalidApiKey() throws Exception {
        mockMvc.perform(post("/api/budgets/")
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Groceries\", \"amount\": 500.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test updating a budget with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateBudgetInvalidApiKey() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(put("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Groceries\", \"amount\": 600.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test deleting a budget with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteBudgetInvalidApiKey() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(delete("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, "invalid_api_key"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving a budget with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBudgetByIdInvalidApiKey() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(get("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all budgets with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllBudgetsInvalidApiKey() throws Exception {
        budgetService.add(budgetDTO);

        mockMvc.perform(get("/api/budgets/")
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all budgets with pagination and sorting.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllBudgetsPaginationAndSorting() throws Exception {
        // Create multiple budgets for testing pagination
        for (int i = 0; i < 10; i++) {
            BudgetDTO budget = new BudgetDTO();
            budget.setTitle("Monthly Groceries " + i);
            budget.setAmount(BigDecimal.valueOf(100.00 + i));
            budget.setCurrency("USD");
            budget.setCategoryId("groceries");
            budget.setUserId(1L);
            budgetService.add(budget);
        }

        mockMvc.perform(get("/api/budgets/?page=0&size=5&sort=amount,desc")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(5))
                .andExpect(jsonPath("$.items[0].amount").value(109.00))
                .andExpect(jsonPath("$.items[4].amount").value(105.00));
    }

    /**
     * Test creating a budget with validation errors.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBudgetValidationErrors() throws Exception {
        // Invalid title
        mockMvc.perform(post("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"\", \"amount\": 500.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isBadRequest());

        // Invalid amount
        mockMvc.perform(post("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Groceries\", \"amount\": -500.00, \"currency\": \"USD\", \"categoryId\": \"groceries\"}"))
                .andExpect(status().isBadRequest());

        // Missing currency
        mockMvc.perform(post("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Groceries\", \"amount\": 500.00, \"categoryId\": \"groceries\", \"userId\": 1}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test retrieving a budget by ID with hypermedia links.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBudgetByIdHypermediaLinks() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(get("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Monthly Groceries"))
                .andExpect(jsonPath("$.amount").value(500.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.categoryId").value("groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }
}
