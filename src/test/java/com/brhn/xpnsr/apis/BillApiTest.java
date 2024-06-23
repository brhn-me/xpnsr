package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.repositories.ApplicationRepository;
import com.brhn.xpnsr.services.BillService;
import com.brhn.xpnsr.services.dtos.BillDTO;
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
 * Integration tests for the Bill API.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class BillApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BillService billService;

    @Autowired
    private ApplicationRepository applicationRepository;

    private BillDTO billDTO;
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";

    @BeforeEach
    public void setUp() {
        // Setup sample billDTO
        billDTO = new BillDTO();
        billDTO.setId(1L);
        billDTO.setTenure(12);
        billDTO.setAmount(BigDecimal.valueOf(1000.00));
        billDTO.setCategoryId("groceries");
    }

    /**
     * Test the creation of a new bill.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBill() throws Exception {
        mockMvc.perform(post("/api/bills/").header(API_KEY_HEADER, SAMPLE_API_KEY).contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": 12, \"amount\": 1000.00, \"categoryId\": \"groceries\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.tenure").value(12)).andExpect(jsonPath("$.amount").value(1000.00)).andExpect(jsonPath("$.categoryId").value("groceries")).andExpect(jsonPath("$._links.self.href").exists()).andExpect(jsonPath("$._links.edit.href").exists()).andExpect(jsonPath("$._links.delete.href").exists()).andExpect(jsonPath("$._links.category.href").exists());
    }

    /**
     * Test creating a bill with invalid input.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBillInvalidInput() throws Exception {
        mockMvc.perform(post("/api/bills/").header(API_KEY_HEADER, SAMPLE_API_KEY).contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": -1, \"amount\": -1000.00, \"categoryId\": \"\"}")).andExpect(status().isBadRequest());
    }

    /**
     * Test updating an existing bill.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateBill() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(put("/api/bills/" + createdBill.getId()).header(API_KEY_HEADER, SAMPLE_API_KEY).contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": 12, \"amount\": 1500.00, \"categoryId\": \"groceries\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.tenure").value(12)).andExpect(jsonPath("$.amount").value(1500.00)).andExpect(jsonPath("$.categoryId").value("groceries")).andExpect(jsonPath("$._links.self.href").exists()).andExpect(jsonPath("$._links.edit.href").exists()).andExpect(jsonPath("$._links.delete.href").exists()).andExpect(jsonPath("$._links.category.href").exists());
    }

    /**
     * Test updating a non-existing bill.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateBillNotFound() throws Exception {
        mockMvc.perform(put("/api/bills/999").header(API_KEY_HEADER, SAMPLE_API_KEY).contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": 12, \"amount\": 1500.00, \"categoryId\": \"groceries\"}")).andExpect(status().isNotFound());
    }

    /**
     * Test retrieving a bill by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBillById() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(get("/api/bills/" + createdBill.getId()).header(API_KEY_HEADER, SAMPLE_API_KEY).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk()).andExpect(jsonPath("$.tenure").value(12)).andExpect(jsonPath("$.amount").value(1000.00)).andExpect(jsonPath("$.categoryId").value("groceries")).andExpect(jsonPath("$._links.self.href").exists()).andExpect(jsonPath("$._links.edit.href").exists()).andExpect(jsonPath("$._links.delete.href").exists()).andExpect(jsonPath("$._links.category.href").exists());
    }

    /**
     * Test retrieving a non-existing bill by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBillByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/bills/999").header(API_KEY_HEADER, SAMPLE_API_KEY).accept(MediaType.APPLICATION_JSON)).andExpect(status().isNotFound());
    }

    /**
     * Test retrieving all bills.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllBills() throws Exception {
        billService.createBill(billDTO);

        mockMvc.perform(get("/api/bills/").header(API_KEY_HEADER, SAMPLE_API_KEY).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk()).andExpect(jsonPath("$.items[0].tenure").value(12)).andExpect(jsonPath("$.items[0].amount").value(1000.00)).andExpect(jsonPath("$.items[0].categoryId").value("groceries")).andExpect(jsonPath("$.items[0]._links.self.href").exists()).andExpect(jsonPath("$.items[0]._links.edit.href").exists()).andExpect(jsonPath("$.items[0]._links.delete.href").exists()).andExpect(jsonPath("$.items[0]._links.category.href").exists());
    }

    /**
     * Test deleting a bill.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteBill() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(delete("/api/bills/" + createdBill.getId()).header(API_KEY_HEADER, SAMPLE_API_KEY)).andExpect(status().isOk());
    }

    /**
     * Test deleting a non-existing bill.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteBillNotFound() throws Exception {
        mockMvc.perform(delete("/api/bills/999").header(API_KEY_HEADER, SAMPLE_API_KEY)).andExpect(status().isNotFound());
    }

    /**
     * Test creating a bill with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBillInvalidApiKey() throws Exception {
        mockMvc.perform(post("/api/bills/").header(API_KEY_HEADER, "invalid_api_key").contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": 12, \"amount\": 1000.00, \"categoryId\": \"groceries\"}")).andExpect(status().isUnauthorized());
    }

    /**
     * Test updating a bill with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateBillInvalidApiKey() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(put("/api/bills/" + createdBill.getId()).header(API_KEY_HEADER, "invalid_api_key").contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": 12, \"amount\": 1500.00, \"categoryId\": \"groceries\"}")).andExpect(status().isUnauthorized());
    }

    /**
     * Test deleting a bill with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteBillInvalidApiKey() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(delete("/api/bills/" + createdBill.getId()).header(API_KEY_HEADER, "invalid_api_key")).andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving a bill with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBillByIdInvalidApiKey() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(get("/api/bills/" + createdBill.getId()).header(API_KEY_HEADER, "invalid_api_key").accept(MediaType.APPLICATION_JSON)).andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all bills with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllBillsInvalidApiKey() throws Exception {
        billService.createBill(billDTO);

        mockMvc.perform(get("/api/bills/").header(API_KEY_HEADER, "invalid_api_key").accept(MediaType.APPLICATION_JSON)).andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all bills with pagination and sorting.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllBillsPaginationAndSorting() throws Exception {
        // Create multiple bills for testing pagination
        for (int i = 0; i < 10; i++) {
            BillDTO bill = new BillDTO();
            bill.setTenure(12);
            bill.setAmount(BigDecimal.valueOf(100.00 + i));
            bill.setCategoryId("groceries");
            billService.createBill(bill);
        }

        mockMvc.perform(get("/api/bills/?page=0&size=5&sort=amount,desc").header(API_KEY_HEADER, SAMPLE_API_KEY).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
    }

    /**
     * Test creating a bill with validation errors.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateBillValidationErrors() throws Exception {
        // Invalid tenure
        mockMvc.perform(post("/api/bills/").header(API_KEY_HEADER, SAMPLE_API_KEY).contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": -1, \"amount\": 100.00, \"categoryId\": \"groceries\"}")).andExpect(status().isBadRequest());

        // Invalid amount
        mockMvc.perform(post("/api/bills/").header(API_KEY_HEADER, SAMPLE_API_KEY).contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": 12, \"amount\": -100.00, \"categoryId\": \"groceries\"}")).andExpect(status().isBadRequest());

        // Missing categoryId
        mockMvc.perform(post("/api/bills/").header(API_KEY_HEADER, SAMPLE_API_KEY).contentType(MediaType.APPLICATION_JSON).content("{\"tenure\": 12, \"amount\": 100.00}")).andExpect(status().isBadRequest());
    }

    /**
     * Test retrieving a bill by ID with hypermedia links.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetBillByIdHypermediaLinks() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(get("/api/bills/" + createdBill.getId()).header(API_KEY_HEADER, SAMPLE_API_KEY).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk()).andExpect(jsonPath("$.tenure").value(12)).andExpect(jsonPath("$.amount").value(1000.00)).andExpect(jsonPath("$.categoryId").value("groceries")).andExpect(jsonPath("$._links.self.href").exists()).andExpect(jsonPath("$._links.edit.href").exists()).andExpect(jsonPath("$._links.delete.href").exists()).andExpect(jsonPath("$._links.category.href").exists());
    }
}
