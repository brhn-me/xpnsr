package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for managing Bill entities.
 */
public interface BillRepository extends JpaRepository<Bill, Long> {
}
