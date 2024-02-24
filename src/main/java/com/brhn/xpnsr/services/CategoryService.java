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

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    public CategoryDTO add(CategoryDTO c) throws BadRequestError {
        Category category = categoryMapper.categoryDTOToCategory(c);
        if (!this.isParentValid(c.getParentId())) {
            throw new BadRequestError(String.format("The parent with ID '%s' does not exist.", c.getParentId()));
        }
        category.setId(CategoryService.generateCategoryId(c.getName()));
        categoryRepository.save(category);
        return categoryMapper.categoryToCategoryDTO(category);
    }

    private boolean isParentValid(String parentId) {
        // check parent category
        if (StringUtils.isNotEmpty(parentId)) {
            Optional<Category> parentCategory = categoryRepository.findById(parentId);
            return parentCategory.isPresent();
        }
        return true;
    }

    /**
     * Generate category id from the category name
     *
     * @param name Name field value of the category
     * @return id lowercased and underscored version of name as id
     */
    public static String generateCategoryId(String name) {
        String id = name.trim() // Remove leading and trailing whitespace
                .toLowerCase() // Convert the entire string to lower case
                .replaceAll("\\s+", "_") // Replace one or more whitespace characters with a single underscore
                .replaceAll("[^a-z0-9_]", ""); // Remove all characters except lowercase letters, numbers, and underscores
        return id;
    }

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

    public CategoryDTO getCategoryById(String id) throws NotFoundError {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new NotFoundError("Category not found with id " + id));
        return categoryMapper.categoryToCategoryDTO(category);
    }

    public Page<CategoryDTO> list(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories.map(categoryMapper::categoryToCategoryDTO);
    }

    public void delete(String id) throws NotFoundError {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new NotFoundError("Category not found with id " + id));
        categoryRepository.delete(category);
    }
}