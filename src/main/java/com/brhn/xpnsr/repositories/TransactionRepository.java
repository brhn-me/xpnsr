package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Transaction;
import com.brhn.xpnsr.models.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByTypeAndDateBetween(TransactionType type, Timestamp startDate, Timestamp endDate);
}
