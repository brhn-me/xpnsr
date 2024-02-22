package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {
}
