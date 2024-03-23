package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.apis.BudgetApi;
import com.brhn.xpnsr.apis.CategoryApi;
import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    CategoryDTO categoryToCategoryDTO(Category category);

    Category categoryDTOToCategory(CategoryDTO categoryDTO);

    @AfterMapping
    default void addHypermediaLinks(Category category, @MappingTarget CategoryDTO categoryDTO) {
        categoryDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CategoryApi.class)
                .getCategoryById(category.getId())).withSelfRel());
    }
}