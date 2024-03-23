package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.apis.BillApi;
import com.brhn.xpnsr.apis.BudgetApi;
import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.services.dtos.BillDTO;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import org.mapstruct.*;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;

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

    @AfterMapping
    default void addHypermediaLinks(Budget budget, @MappingTarget BudgetDTO budgetDTO) {
        budgetDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(BudgetApi.class)
                .getBudgetById(budget.getId())).withSelfRel());
    }
}

