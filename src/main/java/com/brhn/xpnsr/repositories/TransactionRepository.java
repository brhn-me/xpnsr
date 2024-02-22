package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
