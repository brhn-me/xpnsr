package com.brhn.xpnsr.services;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.exceptions.UserExistsError;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.UserRepository;
import com.brhn.xpnsr.services.dtos.UserDTO;
import com.brhn.xpnsr.services.mappers.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;


    @Autowired
    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO add(UserDTO u) throws UserExistsError {
        Optional<User> existingUser = userRepository.findByEmail(u.getEmail());
        if (existingUser.isPresent()) {
            throw new UserExistsError("User with email already exists");
        }
        User user = userMapper.userDTOToUser(u);
        user.setLogin(u.getEmail());
        user.setPasswordHash(passwordEncoder.encode("123456"));
        user.setCreatedDate(new Timestamp(System.currentTimeMillis()));
        user.setCreatedBy("system");
        userRepository.save(user);
        return userMapper.userToUserDTO(user);
    }

    public UserDTO update(Long id, UserDTO u) throws NotFoundError, UserExistsError {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("User not found with id: " + id));

        // check for new email
//        if (userRepository.findByEmail(u.getEmail()).isPresent()) {
//            throw new UserExistsError("Another user already exists with email: " + u.getEmail());
//        }

        user.setFirstName(u.getFirstName());
        user.setLastName(u.getLastName());
        user.setEmail(u.getEmail());
        user.setActivated(u.getActivated());

        user = userRepository.save(user);

        return userMapper.userToUserDTO(user);
    }

    public UserDTO getById(Long id) throws NotFoundError {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new NotFoundError("User not found with id: " + id);
        }
        return userMapper.userToUserDTO(user.get());
    }

    public User getByEmail(String email) throws NotFoundError {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new NotFoundError("User not found with email: " + email);
        }
        return user.get();
    }

    public Page<UserDTO> list(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(userMapper::userToUserDTO);
    }

    public void delete(Long id) {
        Optional<User> user = userRepository.findById(id);
        user.ifPresent(userRepository::delete);
    }
}

