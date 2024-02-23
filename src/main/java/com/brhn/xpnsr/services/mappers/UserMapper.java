package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.services.dtos.UserDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    UserDTO userToUserDTO(User user);

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    User userDTOToUser(UserDTO userDTO);
}