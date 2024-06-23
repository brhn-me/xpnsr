package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Application;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for managing Application entities.
 */
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    /**
     * Retrieves an Application entity by its API key, caching the result if possible.
     *
     * @param key The API key to search for.
     * @return An Optional containing the Application entity if found, otherwise empty.
     */
    @Cacheable(value = "applications", key = "#key")
    Optional<Application> findApplicationByApiKey(String key);
}
