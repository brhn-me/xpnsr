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

/**
 * Service class for managing operations related to users.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Constructs a UserService with necessary repositories, mappers, and password encoder.
     *
     * @param userRepository The repository for accessing User entities.
     * @param userMapper The mapper for converting between User and UserDTO.
     * @param passwordEncoder The encoder for encoding user passwords.
     */
    @Autowired
    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Adds a new user.
     *
     * @param u The UserDTO containing user information.
     * @return The created UserDTO.
     * @throws UserExistsError if a user with the same email already exists.
     */
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

    /**
     * Updates an existing user.
     *
     * @param id The ID of the user to update.
     * @param u The updated UserDTO.
     * @return The updated UserDTO.
     * @throws NotFoundError if the user with the specified ID cannot be found.
     * @throws UserExistsError if another user already exists with the updated email.
     */
    public UserDTO update(Long id, UserDTO u) throws NotFoundError, UserExistsError {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundError("User not found with id: " + id));

        // Check if the new email is already in use by another user
        if (!user.getEmail().equals(u.getEmail()) && userRepository.findByEmail(u.getEmail()).isPresent()) {
            throw new UserExistsError("Another user already exists with email: " + u.getEmail());
        }

        user.setFirstName(u.getFirstName());
        user.setLastName(u.getLastName());
        user.setEmail(u.getEmail());
        user.setActivated(u.getActivated());

        user = userRepository.save(user);

        return userMapper.userToUserDTO(user);
    }

    /**
     * Retrieves a user by ID.
     *
     * @param id The ID of the user to retrieve.
     * @return The UserDTO corresponding to the ID.
     * @throws NotFoundError if the user with the specified ID cannot be found.
     */
    public UserDTO getById(Long id) throws NotFoundError {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new NotFoundError("User not found with id: " + id);
        }
        return userMapper.userToUserDTO(user.get());
    }

    /**
     * Retrieves a user by email.
     *
     * @param email The email address of the user to retrieve.
     * @return The User entity corresponding to the email address.
     * @throws NotFoundError if the user with the specified email cannot be found.
     */
    public User getByEmail(String email) throws NotFoundError {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new NotFoundError("User not found with email: " + email);
        }
        return user.get();
    }

    /**
     * Retrieves a page of users.
     *
     * @param pageable The pagination information.
     * @return A Page of UserDTOs.
     */
    public Page<UserDTO> list(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(userMapper::userToUserDTO);
    }

    /**
     * Deletes a user by ID.
     *
     * @param id The ID of the user to delete.
     */
    public void delete(Long id) {
        Optional<User> user = userRepository.findById(id);
        user.ifPresent(userRepository::delete);
    }
}