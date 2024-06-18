package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.BudgetRepository;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.repositories.UserRepository;
import com.brhn.xpnsr.security.AuthenticationProvider;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import com.brhn.xpnsr.services.mappers.BudgetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service class for handling operations related to budgets.
 */
@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;
    private final BudgetMapper budgetMapper;

    /**
     * Constructs a BudgetService with necessary repositories and mappers.
     *
     * @param budgetRepository The repository for accessing Budget entities.
     * @param userRepository   The repository for accessing User entities.
     * @param budgetMapper     The mapper for converting between Budget and BudgetDTO.
     */
    @Autowired
    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository,
                         CategoryRepository categoryRepository, BudgetMapper budgetMapper) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.budgetMapper = budgetMapper;
    }

    /**
     * Adds a new budget based on the provided BudgetDTO.
     *
     * @param b The BudgetDTO containing budget information.
     * @return The created BudgetDTO.
     * @throws NotFoundError if the associated user cannot be found.
     */
    public BudgetDTO add(BudgetDTO b) {
        Budget budget = budgetMapper.budgetDTOToBudget(b);

        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        budget.setUser(user);

        categoryRepository.findById(b.getCategoryId()).orElseThrow(() -> new NotFoundError("Category not " +
                "found"));

        budget = budgetRepository.save(budget);
        return budgetMapper.budgetToBudgetDTO(budget);
    }

    /**
     * Updates an existing budget identified by its ID.
     *
     * @param id The ID of the budget to update.
     * @param b  The updated BudgetDTO.
     * @return The updated BudgetDTO.
     * @throws RuntimeException if the budget with the specified ID cannot be found.
     * @throws NotFoundError    if the associated user cannot be found.
     */
    public BudgetDTO update(Long id, BudgetDTO b) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
        budget = budgetMapper.budgetDTOToBudget(b);
        budget.setId(id);
        String username = AuthenticationProvider.getCurrentUsername();
        User user = userRepository.findByEmail("sample.user@example.com")
                .orElseThrow(() -> new NotFoundError("User not found with username: " + username));
        budget.setUser(user);

        categoryRepository.findById(b.getCategoryId()).orElseThrow(() -> new NotFoundError("Category not " +
                "found"));

        budget = budgetRepository.save(budget);
        return budgetMapper.budgetToBudgetDTO(budget);
    }

    /**
     * Retrieves a budget by its ID.
     *
     * @param id The ID of the budget to retrieve.
     * @return The corresponding BudgetDTO.
     * @throws NotFoundError if the budget with the specified ID cannot be found.
     */
    public BudgetDTO getBudgetById(Long id) throws NotFoundError {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Budget not found with id " + id));
        return budgetMapper.budgetToBudgetDTO(budget);
    }

    /**
     * Retrieves all budgets paginated.
     *
     * @param pageable The pagination information.
     * @return A Page of BudgetDTOs.
     */
    public Page<BudgetDTO> getAllBudgets(Pageable pageable) {
        Page<Budget> budgets = budgetRepository.findAll(pageable);
        return budgets.map(budgetMapper::budgetToBudgetDTO);
    }

    /**
     * Deletes a budget by its ID.
     *
     * @param id The ID of the budget to delete.
     * @throws NotFoundError if the budget with the specified ID cannot be found.
     */
    public void delete(Long id) throws NotFoundError {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("Budget not found with id " + id));
        budgetRepository.delete(budget);
    }
}