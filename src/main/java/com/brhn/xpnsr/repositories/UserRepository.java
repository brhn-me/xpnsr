package com.brhn.xpnsr.repositories;

import com.brhn.xpnsr.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository interface for managing User entities.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Retrieves an Optional User entity based on the email.
     *
     * @param email The email address of the user.
     * @return Optional<User> containing the User entity if found, otherwise empty.
     */
    Optional<User> findByEmail(String email);
}
