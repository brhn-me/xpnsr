package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.services.dtos.TransactionDTO;
import com.brhn.xpnsr.models.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TransactionMapper {

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    TransactionDTO userToUserDTO(Transaction transaction);

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    TransactionDTO transactionDTOTTransaction(TransactionDTO transactionDTO);
}