package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User add(User u) {
        return null;
    }

    public User update(Long id, User u) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("User not found with id " + id));

//        user.setLogin(u.getLogin());
//        user.setPasswordHash(u.getPasswordHash());
//        user.setFirstName(u.getFirstName());
//        user.setLastName(u.getLastName());
//        user.setEmail(u.getEmail());
//        user.setActivated(u.getActivated());
//        user.setCreatedBy(u.getCreatedBy());
//        user.setCreatedDate(u.getCreatedDate());
//        user.setLastModifiedBy(u.getLastModifiedBy());
//        user.setLastModifiedDate(u.getLastModifiedDate());

        return userRepository.save(user);
    }

    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("User not found with id " + id));
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("User not found with id " + id));
        userRepository.delete(user);
    }
}

