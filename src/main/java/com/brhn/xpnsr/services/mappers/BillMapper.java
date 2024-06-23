package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.BillDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper class to convert between Bill entities and BillDTO data transfer objects.
 */
@Component
public class BillMapper {

    /**
     * Converts a Bill entity to a BillDTO.
     *
     * @param bill The Bill entity to convert.
     * @return The corresponding BillDTO, or null if the input is null.
     */
    public BillDTO billToBillDTO(Bill bill) {
        if (bill == null) {
            return null;
        }

        BillDTO billDTO = new BillDTO();

        // Set properties from Bill entity to BillDTO
        billDTO.setCategoryId(billCategoryId(bill));
        billDTO.setId(bill.getId());
        billDTO.setTenure(bill.getTenure());
        billDTO.setAmount(bill.getAmount());

        return billDTO;
    }

    /**
     * Converts a BillDTO to a Bill entity.
     *
     * @param billDTO The BillDTO to convert.
     * @return The corresponding Bill entity, or null if the input is null.
     */
    public Bill billDTOToBill(BillDTO billDTO) {
        if (billDTO == null) {
            return null;
        }

        Bill bill = new Bill();

        // Set properties from BillDTO to Bill entity
        bill.setId(billDTO.getId());
        bill.setTenure(billDTO.getTenure());
        bill.setAmount(billDTO.getAmount());

        // Set category
        if (billDTO.getCategoryId() != null) {
            Category category = new Category();
            category.setId(billDTO.getCategoryId());
            bill.setCategory(category);
        }

        return bill;
    }

    /**
     * Retrieves the ID of the category associated with the Bill entity.
     *
     * @param bill The Bill entity.
     * @return The ID of the category, or null if the category is null.
     */
    private String billCategoryId(Bill bill) {
        Category category = bill.getCategory();
        if (category == null) {
            return null;
        }
        return category.getId();
    }
}
