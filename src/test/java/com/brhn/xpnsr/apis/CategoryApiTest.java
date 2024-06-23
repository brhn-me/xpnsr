package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.services.CategoryService;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import com.brhn.xpnsr.services.dtos.CustomPagedModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the Category API.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class CategoryApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryService categoryService;

    private CategoryDTO categoryDTO;
    private static final String SAMPLE_API_KEY = "c779c66a194f4ddfbc22a9e2dacb5835";
    private static final String API_KEY_HEADER = "XPNSR-API-KEY";

    @BeforeEach
    public void setUp() {
        // Setup sample categoryDTO
        categoryDTO = new CategoryDTO();
        categoryDTO.setId(UUID.randomUUID().toString());
        categoryDTO.setName("Groceries");
        categoryDTO.setType(com.brhn.xpnsr.models.TransactionType.EXPENSE);
        categoryDTO.setIcon("groceries_icon");
        categoryDTO.setDescription("Expenses for groceries");
        categoryDTO.setParentId(null);
    }

    /**
     * Test the creation of a new category.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateCategory() throws Exception {
        mockMvc.perform(post("/api/categories/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Groceries\", \"type\": \"EXPENSE\", \"icon\": \"groceries_icon\", \"description\": \"Expenses for groceries\", \"parentId\": null}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Groceries"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.icon").value("groceries_icon"))
                .andExpect(jsonPath("$.description").value("Expenses for groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test creating a category with invalid input.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateCategoryInvalidInput() throws Exception {
        mockMvc.perform(post("/api/categories/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"\", \"type\": \"\", \"icon\": \"\", \"description\": \"\", \"parentId\": \"\"}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test updating an existing category.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateCategory() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(put("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Food & Beverages\", \"type\": \"EXPENSE\", \"icon\": \"food_icon\", \"description\": \"Expenses for food and beverages\", \"parentId\": null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Food & Beverages"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.icon").value("food_icon"))
                .andExpect(jsonPath("$.description").value("Expenses for food and beverages"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test updating a non-existing category.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateCategoryNotFound() throws Exception {
        mockMvc.perform(put("/api/categories/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Food & Beverages\", \"type\": \"EXPENSE\", \"icon\": \"food_icon\", \"description\": \"Expenses for food and beverages\", \"parentId\": null}"))
                .andExpect(status().isNotFound());
    }

    /**
     * Test retrieving a category by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetCategoryById() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(get("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Groceries"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.icon").value("groceries_icon"))
                .andExpect(jsonPath("$.description").value("Expenses for groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }

    /**
     * Test retrieving a non-existing category by ID.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetCategoryByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/categories/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    /**
     * Test retrieving all categories.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllCategories() throws Exception {
        categoryService.add(categoryDTO);

        mockMvc.perform(get("/api/categories/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /**
     * Test deleting a category.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteCategory() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(delete("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY))
                .andExpect(status().isOk());
    }

    /**
     * Test deleting a non-existing category.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteCategoryNotFound() throws Exception {
        mockMvc.perform(delete("/api/categories/999")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY))
                .andExpect(status().isNotFound());
    }

    /**
     * Test creating a category with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateCategoryInvalidApiKey() throws Exception {
        mockMvc.perform(post("/api/categories/")
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Groceries\", \"type\": \"EXPENSE\", \"icon\": \"groceries_icon\", \"description\": \"Expenses for groceries\", \"parentId\": null}"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test updating a category with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testUpdateCategoryInvalidApiKey() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(put("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Food & Beverages\", \"type\": \"EXPENSE\", \"icon\": \"food_icon\", \"description\": \"Expenses for food and beverages\", \"parentId\": null}"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test deleting a category with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testDeleteCategoryInvalidApiKey() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(delete("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, "invalid_api_key"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving a category with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetCategoryByIdInvalidApiKey() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(get("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all categories with an invalid API key.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllCategoriesInvalidApiKey() throws Exception {
        categoryService.add(categoryDTO);

        mockMvc.perform(get("/api/categories/")
                        .header(API_KEY_HEADER, "invalid_api_key")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test retrieving all categories with pagination and sorting.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetAllCategoriesPaginationAndSorting() throws Exception {
        // Create multiple categories for testing pagination
        for (int i = 0; i < 10; i++) {
            CategoryDTO category = new CategoryDTO();
            category.setId(UUID.randomUUID().toString());
            category.setName("Category " + i);
            category.setType(com.brhn.xpnsr.models.TransactionType.EXPENSE);
            category.setIcon("icon_" + i);
            category.setDescription("Description " + i);
            category.setParentId(null);
            categoryService.add(category);
        }

        mockMvc.perform(get("/api/categories/?page=0&size=5&sort=name,desc")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /**
     * Test creating a category with validation errors.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testCreateCategoryValidationErrors() throws Exception {
        // Invalid name
        mockMvc.perform(post("/api/categories/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"\", \"type\": \"EXPENSE\", \"icon\": \"groceries_icon\", \"description\": \"Expenses for groceries\", \"parentId\": null}"))
                .andExpect(status().isBadRequest());

        // Invalid type
        mockMvc.perform(post("/api/categories/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Groceries\", \"type\": \"\", \"icon\": \"groceries_icon\", \"description\": \"Expenses for groceries\", \"parentId\": null}"))
                .andExpect(status().isBadRequest());

        // Missing type
        mockMvc.perform(post("/api/categories/")
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Groceries\", \"icon\": \"groceries_icon\", \"description\": \"Expenses for groceries\", \"parentId\": null}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test retrieving a category by ID with hypermedia links.
     *
     * @throws Exception if an error occurs during the request
     */
    @Test
    public void testGetCategoryByIdHypermediaLinks() throws Exception {
        CategoryDTO createdCategory = categoryService.add(categoryDTO);

        mockMvc.perform(get("/api/categories/" + createdCategory.getId())
                        .header(API_KEY_HEADER, SAMPLE_API_KEY)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Groceries"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.icon").value("groceries_icon"))
                .andExpect(jsonPath("$.description").value("Expenses for groceries"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.edit.href").exists())
                .andExpect(jsonPath("$._links.delete.href").exists());
    }
}