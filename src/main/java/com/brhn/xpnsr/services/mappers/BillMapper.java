package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.services.dtos.BillDTO;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BillMapper {

    BillDTO billToBillDTO(Bill bill);

    Bill billDTOToBill(BillDTO billDTO);
}
