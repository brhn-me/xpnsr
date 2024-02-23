package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.services.dtos.TransactionDTO;
import com.brhn.xpnsr.models.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TransactionMapper {

    TransactionMapper INSTANCE = Mappers.getMapper(TransactionMapper.class);

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    TransactionDTO userToUserDTO(Transaction transaction);

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    TransactionDTO transactionDTOTTransaction(TransactionDTO transactionDTO);
}