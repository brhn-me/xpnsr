package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.Application;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    @Cacheable(value = "applications", key = "#key")
    Optional<Application> findApplicationByApiKey(String key);
}
