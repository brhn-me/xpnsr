package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.exceptions.UserExistsError;
import com.brhn.xpnsr.services.UserService;
import com.brhn.xpnsr.services.dtos.CustomPagedModel;
import com.brhn.xpnsr.services.dtos.LinksDTO;
import com.brhn.xpnsr.services.dtos.UserDTO;
import com.brhn.xpnsr.utils.SchemaGeneratorUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.PagedModel;
import org.springframework.hateoas.Link;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for managing users in the XPNSR application.
 * Provides endpoints for creating, updating, retrieving, and deleting users.
 */
@CrossOrigin(origins = "*")
@RestController
@Tag(name = "User API", description = "APIs for managing all users of XPNSR")
@RequestMapping("/api/users")
@Validated
public class UserApi {

    private final UserService userService;
    private final PagedResourcesAssembler<UserDTO> pagedResourcesAssembler;
    private final SchemaGeneratorUtil schemaGeneratorUtil;

    /**
     * Constructs a new UserApi instance with the specified UserService.
     *
     * @param userService             the service for handling user operations
     * @param pagedResourcesAssembler the assembler used for pagination of UserDTOs
     * @param schemaGeneratorUtil     the utility for generating JSON schemas
     */
    @Autowired
    public UserApi(UserService userService, PagedResourcesAssembler<UserDTO> pagedResourcesAssembler, SchemaGeneratorUtil schemaGeneratorUtil) {
        this.userService = userService;
        this.pagedResourcesAssembler = pagedResourcesAssembler;
        this.schemaGeneratorUtil = schemaGeneratorUtil;
    }

    /**
     * Endpoint to create a new user.
     *
     * @param userDTO the user data to create
     * @return ResponseEntity containing the created user with hypermedia links
     * @throws UserExistsError if a user with the same email already exists
     */
    @PostMapping("/")
    @Operation(summary = "Create a new user", description = "Creates a new user and returns the created user details",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details of the new user",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserDTO.class),
                            examples = @ExampleObject(value = "{\"login\": \"john_doe\", \"passwordHash\": \"hashed_password\", \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john.doe@example.com\", \"activated\": true, \"createdBy\": \"admin\", \"createdDate\": \"2024-06-20T12:34:56.789Z\"}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "201", description = "User created successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "409", description = "User already exists"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<UserDTO>> createUser(@Valid @RequestBody UserDTO userDTO) throws UserExistsError {
        UserDTO createdUser = userService.add(userDTO);
        EntityModel<UserDTO> entityModel = EntityModel.of(createdUser);
        addDetailLinks(entityModel);

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
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user", description = "Updates the user details for the given ID and returns the updated user details",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated details of the user",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserDTO.class),
                            examples = @ExampleObject(value = "{\"login\": \"john_doe\", \"passwordHash\": \"hashed_password\", \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john.doe@example.com\", \"activated\": true, \"lastModifiedBy\": \"admin\", \"lastModifiedDate\": \"2024-06-21T12:34:56.789Z\"}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "User updated successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "User not found"),
                    @ApiResponse(responseCode = "409", description = "User already exists"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<UserDTO>> updateUser(@PathVariable @Parameter(description = "ID of the user to be updated") Long id,
                                                           @Valid @RequestBody UserDTO userDTO) throws NotFoundError, UserExistsError {
        UserDTO updatedUser = userService.update(id, userDTO);
        EntityModel<UserDTO> entityModel = EntityModel.of(updatedUser);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Endpoint to retrieve a user by ID.
     *
     * @param id the ID of the user to retrieve
     * @return ResponseEntity containing the retrieved user with hypermedia links
     * @throws NotFoundError if the user with the specified ID is not found
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a user by ID", description = "Returns a single user details for the given ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "User found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "User not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<UserDTO>> getUserById(@PathVariable Long id) throws NotFoundError {
        UserDTO userDTO = userService.getById(id);
        EntityModel<UserDTO> entityModel = EntityModel.of(userDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Endpoint to retrieve all users with pagination.
     *
     * @param pageable pagination information
     * @return ResponseEntity containing a page of users with hypermedia links
     */
    @GetMapping("/")
    @Operation(summary = "Get all users with pagination", description = "Returns a list of all users, with pagination support",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Users retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CustomPagedModel.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<CustomPagedModel<UserDTO>> getAllUsers(@ParameterObject Pageable pageable) {
        Page<UserDTO> usersPage = userService.list(pageable);
        PagedModel<EntityModel<UserDTO>> pagedModel = pagedResourcesAssembler.toModel(usersPage, userDTO -> {
            EntityModel<UserDTO> entityModel = EntityModel.of(userDTO);
            addDetailLinks(entityModel);
            return entityModel;
        });

        CustomPagedModel<UserDTO> customPagedModel = new CustomPagedModel<>(pagedModel.getContent(),
                pagedModel.getMetadata());
        customPagedModel.addLinks(pagedModel.getLinks());

        Link addUserLink = linkTo(methodOn(UserApi.class).createUser(null)).withRel("add").withType("POST");
        customPagedModel.add(addUserLink);

        Link schemaLink = linkTo(methodOn(UserApi.class).getUserSchema()).withRel("schema").withType("GET");
        customPagedModel.add(schemaLink);

        return ResponseEntity.ok(customPagedModel);
    }

    /**
     * Endpoint to delete a user by ID.
     *
     * @param id the ID of the user to delete
     * @return ResponseEntity containing links to the list of users
     * @throws NotFoundError if the user with the specified ID is not found
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user by ID", description = "Deletes a user for the given ID",
            responses = {
                    @ApiResponse(responseCode = "204", description = "User deleted successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "User not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<LinksDTO> deleteUser(@PathVariable @Parameter(description = "ID of the user to delete") Long id) throws NotFoundError {
        userService.delete(id);

        LinksDTO linksDTO = new LinksDTO();
        linksDTO.add(linkTo(methodOn(UserApi.class).getAllUsers(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType("GET"));

        return ResponseEntity.ok(linksDTO);
    }

    /**
     * Adds detailed links to the given EntityModel.
     *
     * @param entityModel The EntityModel to which links are added.
     */
    private void addDetailLinks(EntityModel<UserDTO> entityModel) {
        UserDTO userDTO = entityModel.getContent();
        Long userId = Objects.requireNonNull(userDTO).getId();

        // IANA Links
        entityModel.add(linkTo(methodOn(UserApi.class).getUserById(userId)).withSelfRel().withType("GET"));
        entityModel.add(linkTo(methodOn(UserApi.class).getAllUsers(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType("GET"));

        // Control Links
        entityModel.add(linkTo(methodOn(UserApi.class).updateUser(userId, userDTO)).withRel("edit").withType("PUT"));
        entityModel.add(linkTo(methodOn(UserApi.class).deleteUser(userId)).withRel("delete").withType("DELETE"));
        entityModel.add(linkTo(methodOn(UserApi.class).getUserSchema()).withRel("schema").withType("GET"));
    }

    /**
     * Retrieves the JSON schema for UserDTO.
     *
     * @return ResponseEntity containing the JSON schema for UserDTO.
     */
    @GetMapping("/schema")
    @Operation(summary = "Get schema for UserDTO", description = "Retrieves the JSON schema for UserDTO.")
    public ResponseEntity<String> getUserSchema() {
        String schema = schemaGeneratorUtil.generateSchema(UserDTO.class);
        return ResponseEntity.ok(schema);
    }
}
