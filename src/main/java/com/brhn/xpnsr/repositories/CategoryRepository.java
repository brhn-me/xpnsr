package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for managing Category entities.
 */
public interface CategoryRepository extends JpaRepository<Category, String> {
}
