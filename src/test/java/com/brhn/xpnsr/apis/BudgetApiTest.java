package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.repositories.ApplicationRepository;
import com.brhn.xpnsr.repositories.UserRepository;
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

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class BudgetApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    private BudgetDTO budgetDTO;
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";

    @BeforeEach
    public void setUp() {
        // Setup sample budgetDTO
        budgetDTO = new BudgetDTO();
        budgetDTO.setId(1L);
        budgetDTO.setTitle("Monthly Budget");
        budgetDTO.setDescription("Monthly household budget");
        budgetDTO.setAmount(BigDecimal.valueOf(2000.00));
        budgetDTO.setCurrency("USD");
        budgetDTO.setCategoryId("groceries");
        budgetDTO.setUserId(1L);
    }

    @Test
    public void testCreateBudget() throws Exception {
        mockMvc.perform(post("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Monthly Budget\", \"description\": \"Monthly household budget\", " +
                                "\"amount\": 2000.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", " +
                                "\"userId\": 1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Monthly Budget"))
                .andExpect(jsonPath("$.description").value("Monthly household budget"))
                .andExpect(jsonPath("$.amount").value(2000.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.categoryId").value("groceries"));
    }

    @Test
    public void testUpdateBudget() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(put("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Updated Budget\", \"description\": \"Updated description\", " +
                                "\"amount\": 2500.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", " +
                                "\"userId\": 1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Budget"))
                .andExpect(jsonPath("$.description").value("Updated description"))
                .andExpect(jsonPath("$.amount").value(2500.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.categoryId").value("groceries"));
    }

    @Test
    public void testGetBudgetById() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(get("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Monthly Budget"))
                .andExpect(jsonPath("$.description").value("Monthly household budget"))
                .andExpect(jsonPath("$.amount").value(2000.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.categoryId").value("groceries"));
    }

    @Test
    public void testGetAllBudgets() throws Exception {
        budgetService.add(budgetDTO);

        mockMvc.perform(get("/api/budgets/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Monthly Budget"))
                .andExpect(jsonPath("$.content[0].description").value("Monthly household budget"))
                .andExpect(jsonPath("$.content[0].amount").value(2000.00))
                .andExpect(jsonPath("$.content[0].currency").value("USD"))
                .andExpect(jsonPath("$.content[0].categoryId").value("groceries"));
    }

    @Test
    public void testDeleteBudget() throws Exception {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);

        mockMvc.perform(delete("/api/budgets/" + createdBudget.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)) // Include the SAMPLE_API_KEY in the header
                .andExpect(status().isNoContent());
    }
}
