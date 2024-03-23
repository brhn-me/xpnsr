package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.apis.BillApi;
import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.services.dtos.BillDTO;
import org.mapstruct.*;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;

import java.util.Optional;

@Mapper(componentModel = "spring", uses = {CategoryRepository.class})
public interface BillMapper {
    @Mapping(source = "category.id", target = "categoryId")
    BillDTO billToBillDTO(Bill bill);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "user", ignore = true)
    Bill billDTOToBill(BillDTO billDTO);

    @AfterMapping
    default void mapCategoryIdToCategory(BillDTO billDTO, @MappingTarget Bill bill,
                                         @Context CategoryRepository categoryRepository) {
        if (billDTO.getCategoryId() != null) {
            Optional<Category> category = categoryRepository.findById(billDTO.getCategoryId());
            category.ifPresent(bill::setCategory);
        }
    }

    @AfterMapping
    default void addHypermediaLinks(Bill bill, @MappingTarget BillDTO billDTO) {
        billDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(BillApi.class)
                .getBillById(bill.getId())).withSelfRel());
    }
}
