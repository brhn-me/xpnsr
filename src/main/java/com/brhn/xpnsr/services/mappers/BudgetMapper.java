package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper class to convert between Budget entities and BudgetDTO data transfer objects.
 */
@Component
public class BudgetMapper {

    /**
     * Converts a Budget entity to a BudgetDTO.
     *
     * @param budget The Budget entity to convert.
     * @return The corresponding BudgetDTO, or null if the input is null.
     */
    public BudgetDTO budgetToBudgetDTO(Budget budget) {
        if (budget == null) {
            return null;
        }

        BudgetDTO budgetDTO = new BudgetDTO();

        // Set properties from Budget entity to BudgetDTO
        budgetDTO.setCategoryId(budgetCategoryId(budget));
        budgetDTO.setId(budget.getId());
        budgetDTO.setTitle(budget.getTitle());
        budgetDTO.setDescription(budget.getDescription());
        budgetDTO.setAmount(budget.getAmount());
        budgetDTO.setCurrency(budget.getCurrency());

        return budgetDTO;
    }

    /**
     * Converts a BudgetDTO to a Budget entity.
     *
     * @param budgetDTO The BudgetDTO to convert.
     * @return The corresponding Budget entity, or null if the input is null.
     */
    public Budget budgetDTOToBudget(BudgetDTO budgetDTO) {
        if (budgetDTO == null) {
            return null;
        }

        Budget budget = new Budget();

        // Set properties from BudgetDTO to Budget entity
        budget.setId(budgetDTO.getId());
        budget.setTitle(budgetDTO.getTitle());
        budget.setDescription(budgetDTO.getDescription());
        budget.setAmount(budgetDTO.getAmount());
        budget.setCurrency(budgetDTO.getCurrency());

        // Set category
        if (budgetDTO.getCategoryId() != null) {
            Category category = new Category();
            category.setId(budgetDTO.getCategoryId());
            budget.setCategory(category);
        }

        return budget;
    }

    /**
     * Retrieves the ID of the category associated with the Budget entity.
     *
     * @param budget The Budget entity.
     * @return The ID of the category, or null if the category or its ID is null.
     */
    private String budgetCategoryId(Budget budget) {
        if (budget == null) {
            return null;
        }
        Category category = budget.getCategory();
        if (category == null) {
            return null;
        }
        String id = category.getId();
        if (id == null) {
            return null;
        }
        return id;
    }
}