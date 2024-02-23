package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.exceptions.BadRequestError;
import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import org.mapstruct.*;

import java.util.Optional;

@Mapper(componentModel = "spring", uses = {CategoryRepository.class})
public interface BudgetMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(target = "userId", ignore = true)
    BudgetDTO budgetToBudgetDTO(Budget budget);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "user", ignore = true)
    Budget budgetDTOToBudget(BudgetDTO budgetDTO);

    @AfterMapping
    default void mapCategoryIdToCategory(BudgetDTO budgetDTO, @MappingTarget Budget budget,
                                         @Context CategoryRepository categoryRepository) {
        if (budgetDTO.getCategoryId() != null) {
            Optional<Category> category = categoryRepository.findById(budgetDTO.getCategoryId());
            category.ifPresent(budget::setCategory);
        }
    }
}

