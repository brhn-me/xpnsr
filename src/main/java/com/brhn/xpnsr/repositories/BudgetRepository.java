package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for managing Budget entities.
 */
public interface BudgetRepository extends JpaRepository<Budget, Long> {
}
