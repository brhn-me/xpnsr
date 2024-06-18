package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.BadRequestError;
import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import com.brhn.xpnsr.services.mappers.CategoryMapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service class for managing operations related to categories.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Constructs a CategoryService with necessary repositories and mappers.
     *
     * @param categoryRepository The repository for accessing Category entities.
     * @param categoryMapper The mapper for converting between Category and CategoryDTO.
     */
    @Autowired
    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    /**
     * Adds a new category based on the provided CategoryDTO.
     *
     * @param c The CategoryDTO containing category information.
     * @return The created CategoryDTO.
     * @throws BadRequestError if the parent category specified in the DTO does not exist.
     */
    public CategoryDTO add(CategoryDTO c) throws BadRequestError {
        Category category = categoryMapper.categoryDTOToCategory(c);
        if (!this.isParentValid(c.getParentId())) {
            throw new BadRequestError(String.format("The parent with ID '%s' does not exist.", c.getParentId()));
        }
        category.setId(CategoryService.generateCategoryId(c.getName()));
        categoryRepository.save(category);
        return categoryMapper.categoryToCategoryDTO(category);
    }

    /**
     * Checks if a parent category exists.
     *
     * @param parentId The ID of the parent category to check.
     * @return true if the parent category exists; false otherwise.
     */
    private boolean isParentValid(String parentId) {
        if (StringUtils.isNotEmpty(parentId)) {
            Optional<Category> parentCategory = categoryRepository.findById(parentId);
            return parentCategory.isPresent();
        }
        return true;
    }

    /**
     * Generates a category ID from the category name.
     *
     * @param name The name of the category.
     * @return The generated category ID.
     */
    public static String generateCategoryId(String name) {
        String id = name.trim()
                .toLowerCase()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-z0-9_]", "");
        return id;
    }

    /**
     * Updates an existing category identified by its ID.
     *
     * @param id The ID of the category to update.
     * @param c The updated CategoryDTO.
     * @return The updated CategoryDTO.
     * @throws NotFoundError if the category with the specified ID cannot be found.
     * @throws BadRequestError if the parent category specified in the DTO does not exist.
     */
    public CategoryDTO update(String id, CategoryDTO c) throws NotFoundError, BadRequestError {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new NotFoundError("Category not found with id " + id));
        if (!isParentValid(c.getParentId())) {
            throw new BadRequestError(String.format("The parent with ID '%s' does not exist.", c.getParentId()));
        }
        // cannot change id
        category.setName(c.getName());
        category.setIcon(c.getIcon());
        category.setDescription(c.getDescription());
        category.setParentId(c.getParentId());
        category = categoryRepository.save(category);
        return categoryMapper.categoryToCategoryDTO(category);
    }

    /**
     * Retrieves a category by its ID.
     *
     * @param id The ID of the category to retrieve.
     * @return The corresponding CategoryDTO.
     * @throws NotFoundError if the category with the specified ID cannot be found.
     */
    public CategoryDTO getCategoryById(String id) throws NotFoundError {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new NotFoundError("Category not found with id " + id));
        return categoryMapper.categoryToCategoryDTO(category);
    }

    /**
     * Retrieves all categories paginated.
     *
     * @param pageable The pagination information.
     * @return A Page of CategoryDTOs.
     */
    public Page<CategoryDTO> list(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories.map(categoryMapper::categoryToCategoryDTO);
    }

    /**
     * Deletes a category by its ID.
     *
     * @param id The ID of the category to delete.
     * @throws NotFoundError if the category with the specified ID cannot be found.
     */
    public void delete(String id) throws NotFoundError {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new NotFoundError("Category not found with id " + id));
        categoryRepository.delete(category);
    }
}
