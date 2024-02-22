package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
