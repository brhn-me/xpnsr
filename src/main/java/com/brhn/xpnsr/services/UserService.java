package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.exceptions.UserExistsError;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User add(User u) throws UserExistsError {
        Optional<User> existingUser = userRepository.findByEmail(u.getEmail());
        if (existingUser.isPresent()) {
            throw new UserExistsError("User with email already exists");
        }
        return userRepository.save(u);
    }

    public User update(Long id, User u) throws NotFoundError, UserExistsError {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("User not found with id: " + id));

        // check for new email
        if (userRepository.findByEmail(u.getEmail()).isPresent()) {
            throw new UserExistsError("Another user already exists with email: " + u.getEmail());
        }

        user.setLogin(u.getLogin());
        user.setPasswordHash(u.getPasswordHash());
        user.setEmail(u.getEmail());
        user.setFirstName(u.getFirstName());
        user.setLastName(u.getLastName());
        user.setActivated(u.getActivated());

        return userRepository.save(user);
    }

    public User getById(Long id) throws NotFoundError {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new NotFoundError("User not found with id: " + id);
        }
        return user.get();
    }

    public User getByEmail(String email) throws NotFoundError {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new NotFoundError("User not found with email: " + email);
        }
        return user.get();
    }

    public Page<User> list(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public void delete(Long id) {
        Optional<User> user = userRepository.findById(id);
        user.ifPresent(userRepository::delete);
    }
}

