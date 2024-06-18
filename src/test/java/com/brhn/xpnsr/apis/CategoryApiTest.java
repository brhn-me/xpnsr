package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.models.TransactionType;
import com.brhn.xpnsr.repositories.ApplicationRepository;
import com.brhn.xpnsr.services.CategoryService;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class CategoryApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ApplicationRepository applicationRepository;

    private CategoryDTO categoryDTO;
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";

    @BeforeEach
    public void setUp() {
        // Setup sample CategoryDTO
        categoryDTO = new CategoryDTO();
        categoryDTO.setId("1");
        categoryDTO.setName("Utilities");
        categoryDTO.setType(TransactionType.EXPENSE);
        categoryDTO.setDescription("Utility bills like electricity, water, etc.");
        categoryDTO.setIcon("utilities_icon");
        categoryDTO.setParentId(null);
    }

    @Test
    public void testCreateCategory() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Utilities\", \"type\": \"EXPENSE\", \"description\": \"Utility bills like electricity, water, etc.\", \"icon\": \"utilities_icon\", \"parentId\": null}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Utilities"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.description").value("Utility bills like electricity, water, etc."))
                .andExpect(jsonPath("$.icon").value("utilities_icon"));
    }

    @Test
    public void testUpdateCategory() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(put("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Updated Utilities\", \"type\": \"EXPENSE\", \"description\": \"Updated description\", \"icon\": \"updated_utilities_icon\", \"parentId\": null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Utilities"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.description").value("Updated description"))
                .andExpect(jsonPath("$.icon").value("updated_utilities_icon"));
    }

    @Test
    public void testGetCategoryById() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(get("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Utilities"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.description").value("Utility bills like electricity, water, etc."))
                .andExpect(jsonPath("$.icon").value("utilities_icon"));
    }

    @Test
    public void testGetAllCategories() throws Exception {
        categoryService.add(categoryDTO);

        mockMvc.perform(get("/api/categories/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY) // Include the SAMPLE_API_KEY in the header
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testDeleteCategory() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(delete("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)) // Include the SAMPLE_API_KEY in the header
                .andExpect(status().isNoContent());
    }
}
