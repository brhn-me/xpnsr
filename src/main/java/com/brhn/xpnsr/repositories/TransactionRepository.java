package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.models.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

/**
 * Repository interface for managing Transaction entities.
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Retrieves a list of Transaction entities by type and date range.
     *
     * @param type      The type of transaction (EARNING or EXPENSE).
     * @param startDate The start date of the date range.
     * @param endDate   The end date of the date range.
     * @return A list of Transaction entities matching the criteria.
     */
    List<Transaction> findByTypeAndDateBetween(TransactionType type, Timestamp startDate, Timestamp endDate);
}
