package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.exceptions.UserExistsError;
import com.brhn.xpnsr.services.UserService;
import com.brhn.xpnsr.services.dtos.UserDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for managing users in the XPNSR application.
 * Provides endpoints for creating, updating, retrieving, listing, and deleting users.
 */
@RestController
@Tag(name = "User API", description = "APIs for managing all users of XPNSR")
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserApi {

    private final UserService userService;

    /**
     * Constructs a new UserApi instance with the specified UserService.
     *
     * @param userService the service for handling user operations
     */
    @Autowired
    public UserApi(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint to create a new user.
     *
     * @param userDTO the user data to create
     * @return ResponseEntity containing the created user with hypermedia links
     * @throws UserExistsError if a user with the same email already exists
     */
    @Operation(summary = "Create a new user", responses = {
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

    /**
     * Endpoint to update an existing user.
     *
     * @param id      the ID of the user to update
     * @param userDTO the updated user data
     * @return ResponseEntity containing the updated user with hypermedia links
     * @throws NotFoundError   if the user with the specified ID is not found
     * @throws UserExistsError if a user with the same email already exists
     */
    @Operation(summary = "Update an existing user", responses = {
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

    /**
     * Endpoint to retrieve a user by ID.
     *
     * @param id the ID of the user to retrieve
     * @return ResponseEntity containing the retrieved user with hypermedia links
     * @throws NotFoundError if the user with the specified ID is not found
     */
    @Operation(summary = "Get a user by ID", responses = {
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

    /**
     * Endpoint to retrieve all users with pagination.
     *
     * @param pageable pagination information
     * @return ResponseEntity containing a page of users with hypermedia links
     */
    @Operation(summary = "Get all users with pagination", responses = {
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

    /**
     * Endpoint to delete a user by ID.
     *
     * @param id the ID of the user to delete
     * @return ResponseEntity indicating the success of the deletion operation
     */
    @Operation(summary = "Delete a user by ID", responses = {
            @ApiResponse(description = "User deleted successfully", responseCode = "204"),
            @ApiResponse(description = "User not found", responseCode = "404")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}