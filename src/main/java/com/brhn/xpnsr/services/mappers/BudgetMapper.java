package com.brhn.xpnsr.services.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.services.dtos.BudgetDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BudgetMapper {

    BudgetDTO budgetToBudgetDTO(Budget budget);

    Budget budgetDTOToBudget(BudgetDTO budgetDTO);
}

