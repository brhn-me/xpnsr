package com.brhn.xpnsr.services.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.CategoryDTO;

@Mapper
public interface CategoryMapper {

    CategoryMapper INSTANCE = Mappers.getMapper(CategoryMapper.class);

    CategoryDTO categoryToCategoryDTO(Category category);

    Category categoryDTOToCategory(CategoryDTO categoryDTO);
}
