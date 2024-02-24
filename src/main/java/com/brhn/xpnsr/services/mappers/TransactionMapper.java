package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
import org.mapstruct.*;

import java.util.Optional;

@Mapper(componentModel = "spring", uses = {CategoryRepository.class})
public interface TransactionMapper {

    @Mapping(target = "primaryCategory", ignore = true)
    @Mapping(target = "secondaryCategory", ignore = true)
    @Mapping(target = "user", ignore = true)
    Transaction transactionDTOToTransaction(TransactionDTO transactionDTO);

    @Mapping(source = "primaryCategory.id", target = "primaryCategoryId")
    @Mapping(source = "secondaryCategory.id", target = "secondaryCategoryId")
    TransactionDTO transactionToTransactionDTO(Transaction transaction);

    @AfterMapping
    default void mapCategoryIdsToCategories(TransactionDTO dto, @MappingTarget Transaction entity,
                                            @Context CategoryRepository categoryRepository) {
        Optional<Category> primaryCategory = categoryRepository.findById(dto.getPrimaryCategoryId());
        primaryCategory.ifPresent(entity::setPrimaryCategory);

        Optional<Category> secondaryCategory = categoryRepository.findById(dto.getSecondaryCategoryId());
        secondaryCategory.ifPresent(entity::setSecondaryCategory);
    }
}