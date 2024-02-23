package com.brhn.xpnsr.services.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.services.dtos.BudgetDTO;

@Mapper
public interface BudgetMapper {

    BudgetMapper INSTANCE = Mappers.getMapper(BudgetMapper.class);

    BudgetDTO budgetToBudgetDTO(Budget budget);

    Budget budgetDTOToBudget(BudgetDTO budgetDTO);
}

