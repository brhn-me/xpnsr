package com.brhn.xpnsr.apis;


import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.exceptions.UserExistsError;
import com.brhn.xpnsr.models.User;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "User API", description = "The api for managing all users of XPNSR")
@RequestMapping("/api/users")
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
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) throws UserExistsError {
        return ResponseEntity.ok(userService.add(userDTO));
    }

    @Operation(summary = "Update an existing user",
            responses = {
                    @ApiResponse(description = "User updated successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(description = "User not found", responseCode = "404"),
                    @ApiResponse(description = "User already exists with same email", responseCode = "409")
            })
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) throws NotFoundError, UserExistsError {
        return ResponseEntity.ok(userService.update(id, userDTO));
    }

    @Operation(summary = "Get a user by ID",
            responses = {
                    @ApiResponse(description = "User found", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = UserDTO.class))),
                    @ApiResponse(description = "User not found", responseCode = "404")
            })

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) throws NotFoundError {
        return ResponseEntity.ok(userService.getById(id));
    }

    @Operation(summary = "Get all users with pagination",
            responses = {
                    @ApiResponse(description = "List of users", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = Page.class)))
            })
    @GetMapping("/")
    public ResponseEntity<Page<UserDTO>> getAllUsers(@ParameterObject Pageable pageable) {
        Page<UserDTO> users = userService.list(pageable);
        return ResponseEntity.ok(users);
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
