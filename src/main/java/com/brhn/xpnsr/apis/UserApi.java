package com.brhn.xpnsr.apis;


import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.exceptions.UserExistsError;
import com.brhn.xpnsr.services.UserService;
import com.brhn.xpnsr.services.dtos.UserDTO;
import com.brhn.xpnsr.services.mappers.UserMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@Tag(name = "User API", description = "The api for managing all users of XPNSR")
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserApi {

    private final UserService userService;

    @Autowired
    public UserApi(UserService userService, UserMapper userMapper) {
        this.userService = userService;

    }

    @Operation(summary = "Create a new user",
            responses = {
                    @ApiResponse(description = "User created successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(description = "User already exists", responseCode = "409")
            })
    @PostMapping
    public ResponseEntity<EntityModel<UserDTO>> createUser(@RequestBody UserDTO userDTO) throws UserExistsError {
        UserDTO createdUser = userService.add(userDTO);
        EntityModel<UserDTO> entityModel = EntityModel.of(createdUser,
                linkTo(methodOn(UserApi.class).getUserById(createdUser.getId())).withSelfRel(),
                linkTo(methodOn(UserApi.class).getAllUsers(Pageable.unpaged())).withRel("all-users"));

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    @Operation(summary = "Update an existing user",
            responses = {
                    @ApiResponse(description = "User updated successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(description = "User not found", responseCode = "404"),
                    @ApiResponse(description = "User already exists with same email", responseCode = "409")
            })
    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) throws NotFoundError, UserExistsError {
        UserDTO updatedUser = userService.update(id, userDTO);
        EntityModel<UserDTO> entityModel = EntityModel.of(updatedUser,
                linkTo(methodOn(UserApi.class).getUserById(id)).withSelfRel(),
                linkTo(methodOn(UserApi.class).getAllUsers(Pageable.unpaged())).withRel("all-users"));

        return ResponseEntity.ok(entityModel);
    }

    @Operation(summary = "Get a user by ID",
            responses = {
                    @ApiResponse(description = "User found", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(description = "User not found", responseCode = "404")
            })

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<UserDTO>> getUserById(@PathVariable Long id) throws NotFoundError {
        UserDTO userDTO = userService.getById(id);
        EntityModel<UserDTO> entityModel = EntityModel.of(userDTO,
                linkTo(methodOn(UserApi.class).getUserById(id)).withSelfRel(),
                linkTo(methodOn(UserApi.class).getAllUsers(Pageable.unpaged())).withRel("all-users"));

        return ResponseEntity.ok(entityModel);
    }

    @Operation(summary = "Get all users with pagination",
            responses = {
                    @ApiResponse(description = "List of users", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = Page.class)))
            })
    @GetMapping("/")
    public ResponseEntity<Page<EntityModel<UserDTO>>> getAllUsers(Pageable pageable) {
        Page<UserDTO> users = userService.list(pageable);
        Page<EntityModel<UserDTO>> pagedModel = users.map(userDTO ->
                EntityModel.of(userDTO,
                        linkTo(methodOn(UserApi.class).getUserById(userDTO.getId())).withRel("user"),
                        linkTo(methodOn(UserApi.class).getAllUsers(pageable)).withSelfRel()
                )
        );

        return ResponseEntity.ok(pagedModel);
    }

    @Operation(summary = "Delete a user by ID",
            responses = {
                    @ApiResponse(description = "User deleted successfully", responseCode = "204"),
                    @ApiResponse(description = "User not found", responseCode = "404")
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
