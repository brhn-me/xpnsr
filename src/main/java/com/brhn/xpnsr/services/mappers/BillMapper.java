package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.BillDTO;
import org.springframework.stereotype.Component;

@Component
public class BillMapper {

    public BillDTO billToBillDTO(Bill bill) {
        if (bill == null) {
            return null;
        }

        BillDTO billDTO = new BillDTO();

        billDTO.setCategoryId(billCategoryId(bill));
        billDTO.setId(bill.getId());
        billDTO.setTenure(bill.getTenure());
        billDTO.setAmount(bill.getAmount());

        return billDTO;
    }

    public Bill billDTOToBill(BillDTO billDTO) {
        if (billDTO == null) {
            return null;
        }

        Bill bill = new Bill();

        bill.setId(billDTO.getId());
        bill.setTenure(billDTO.getTenure());
        bill.setAmount(billDTO.getAmount());

        // set category
        if (billDTO.getCategoryId() != null) {
            Category category = new Category();
            category.setId(billDTO.getCategoryId());
            bill.setCategory(category);
        }

        return bill;
    }

    private String billCategoryId(Bill bill) {
        Category category = bill.getCategory();
        if (category == null) {
            return null;
        }
        return category.getId();
    }
}
