package com.brhn.xpnsr.services.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.brhn.xpnsr.models.Bill;
import com.brhn.xpnsr.services.dtos.BillDTO;

@Mapper
public interface BillMapper {

    BillMapper INSTANCE = Mappers.getMapper(BillMapper.class);

    BillDTO billToBillDTO(Bill bill);

    Bill billDTOToBill(BillDTO billDTO);
}
