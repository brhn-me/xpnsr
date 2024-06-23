package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.services.dtos.UserDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper class to convert between User entities and UserDTO data transfer objects.
 */
@Component
public class UserMapper {

    /**
     * Converts a User entity to a UserDTO.
     *
     * @param user The User entity to convert.
     * @return The corresponding UserDTO, or null if the input is null.
     */
    public UserDTO userToUserDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setId(user.getId());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEmail(user.getEmail());
        userDTO.setActivated(user.getActivated());

        return userDTO;
    }

    /**
     * Converts a UserDTO to a User entity.
     *
     * @param userDTO The UserDTO to convert.
     * @return The corresponding User entity, or null if the input is null.
     */
    public User userDTOToUser(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        }

        User user = new User();

        user.setId(userDTO.getId());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setActivated(userDTO.getActivated());

        return user;
    }
}
