package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper class to convert between Category entities and CategoryDTO data transfer objects.
 */
@Component
public class CategoryMapper {

    /**
     * Converts a Category entity to a CategoryDTO.
     *
     * @param category The Category entity to convert.
     * @return The corresponding CategoryDTO, or null if the input is null.
     */
    public CategoryDTO categoryToCategoryDTO(Category category) {
        if (category == null) {
            return null;
        }

        CategoryDTO categoryDTO = new CategoryDTO();

        // Set properties from Category entity to CategoryDTO
        categoryDTO.setId(category.getId());
        categoryDTO.setName(category.getName());
        categoryDTO.setType(category.getType());
        categoryDTO.setIcon(category.getIcon());
        categoryDTO.setDescription(category.getDescription());
        categoryDTO.setParentId(category.getParentId());

        return categoryDTO;
    }

    /**
     * Converts a CategoryDTO to a Category entity.
     *
     * @param categoryDTO The CategoryDTO to convert.
     * @return The corresponding Category entity, or null if the input is null.
     */
    public Category categoryDTOToCategory(CategoryDTO categoryDTO) {
        if (categoryDTO == null) {
            return null;
        }

        Category category = new Category();

        // Set properties from CategoryDTO to Category entity
        category.setId(categoryDTO.getId());
        category.setName(categoryDTO.getName());
        category.setType(categoryDTO.getType());
        category.setIcon(categoryDTO.getIcon());
        category.setDescription(categoryDTO.getDescription());
        category.setParentId(categoryDTO.getParentId());

        return category;
    }
}
