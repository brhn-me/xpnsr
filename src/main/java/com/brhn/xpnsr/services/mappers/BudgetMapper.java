package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper {

    public BudgetDTO budgetToBudgetDTO(Budget budget) {
        if (budget == null) {
            return null;
        }

        BudgetDTO budgetDTO = new BudgetDTO();

        budgetDTO.setCategoryId(budgetCategoryId(budget));
        budgetDTO.setId(budget.getId());
        budgetDTO.setTitle(budget.getTitle());
        budgetDTO.setDescription(budget.getDescription());
        budgetDTO.setAmount(budget.getAmount());
        budgetDTO.setCurrency(budget.getCurrency());

        return budgetDTO;
    }

    public Budget budgetDTOToBudget(BudgetDTO budgetDTO) {
        if (budgetDTO == null) {
            return null;
        }

        Budget budget = new Budget();

        budget.setId(budgetDTO.getId());
        budget.setTitle(budgetDTO.getTitle());
        budget.setDescription(budgetDTO.getDescription());
        budget.setAmount(budgetDTO.getAmount());
        budget.setCurrency(budgetDTO.getCurrency());

        // set category
        if (budgetDTO.getCategoryId() != null) {
            Category category = new Category();
            category.setId(budgetDTO.getCategoryId());
            budget.setCategory(category);
        }

        return budget;
    }

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
