package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
