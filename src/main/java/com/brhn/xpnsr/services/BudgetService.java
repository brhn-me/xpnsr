package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.BudgetRepository;
import com.brhn.xpnsr.repositories.UserRepository;
import com.brhn.xpnsr.security.AuthenticationProvider;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import com.brhn.xpnsr.services.mappers.BudgetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;

    @Autowired
    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository, BudgetMapper budgetMapper) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.budgetMapper = budgetMapper;
    }

    public BudgetDTO add(BudgetDTO b) {
        Budget budget = budgetMapper.budgetDTOToBudget(b);

        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        budget.setUser(user);

        budget = budgetRepository.save(budget);
        return budgetMapper.budgetToBudgetDTO(budget);
    }

    public BudgetDTO update(Long id, BudgetDTO b) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
        budget = budgetMapper.budgetDTOToBudget(b);
        budget.setId(id);
        budget = budgetRepository.save(budget);
        return budgetMapper.budgetToBudgetDTO(budget);
    }

    public BudgetDTO getBudgetById(Long id) throws NotFoundError {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Budget not found with id " + id));
        return budgetMapper.budgetToBudgetDTO(budget);
    }

    public Page<BudgetDTO> getAllBudgets(Pageable pageable) {
        Page<Budget> budgets = budgetRepository.findAll(pageable);
        return budgets.map(budgetMapper::budgetToBudgetDTO);
    }

    public void delete(Long id) throws NotFoundError {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Budget not found with id " + id));
        budgetRepository.delete(budget);
    }
}

