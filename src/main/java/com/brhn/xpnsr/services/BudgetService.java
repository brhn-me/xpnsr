package com.brhn.xpnsr.services;

import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.repositories.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    @Autowired
    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public Budget add(Budget budget) {
        return budgetRepository.save(budget);
    }

    public Budget update(Long id, Budget budgetDetails) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
        budget.setDescription(budgetDetails.getDescription());
        budget.setTitle(budgetDetails.getTitle());
        budget.setAmount(budgetDetails.getAmount());
        budget.setCurrency(budgetDetails.getCurrency());
        return budgetRepository.save(budget);
    }

    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
    }

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public void delete(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
        budgetRepository.delete(budget);
    }
}
