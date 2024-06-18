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

    @Test
    public void testCreateBill() throws Exception {
        mockMvc.perform(post("/api/bills/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tenure\": 12, \"amount\": 1000.00, \"categoryId\": \"groceries\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenure").value(12))
                .andExpect(jsonPath("$.amount").value(1000.00))
                .andExpect(jsonPath("$.categoryId").value("travel"));
    }

    @Test
    public void testUpdateBill() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(put("/api/bills/" + createdBill.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tenure\": 12, \"amount\": 1000.00, \"categoryId\": \"groceries\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenure").value(12))
                .andExpect(jsonPath("$.amount").value(1000.00))
                .andExpect(jsonPath("$.categoryId").value("groceries"));
    }

    @Test
    public void testGetBillById() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(get("/api/bills/" + createdBill.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenure").value(12))
                .andExpect(jsonPath("$.amount").value(1000.00))
                .andExpect(jsonPath("$.categoryId").value("groceries"));
    }

    @Test
    public void testGetAllBills() throws Exception {
        billService.createBill(billDTO);

        mockMvc.perform(get("/api/bills/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].tenure").value(12))
                .andExpect(jsonPath("$.content[0].amount").value(1000.00))
                .andExpect(jsonPath("$.content[0].categoryId").value("groceries"));
    }

    @Test
    public void testDeleteBill() throws Exception {
        BillDTO createdBill = billService.createBill(billDTO);

        mockMvc.perform(delete("/api/bills/" + createdBill.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)) // Include the SAMPLE_API_KEY in the header
                .andExpect(status().isNoContent());
    }
}