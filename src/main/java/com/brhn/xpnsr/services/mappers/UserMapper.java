package com.brhn.xpnsr.services.mappers;

import com.brhn.xpnsr.apis.UserApi;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.services.dtos.UserDTO;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    UserDTO userToUserDTO(User user);

    // @Mapping(source = "createdBy", target = "createdBy") // sample: skip mapping if names are identical
    // @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    User userDTOToUser(UserDTO userDTO);

    @AfterMapping
    default void addHypermediaLinks(User user, @MappingTarget UserDTO userDTO) {
        userDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(UserApi.class)
                .getUserById(user.getId())).withSelfRel());
    }
}