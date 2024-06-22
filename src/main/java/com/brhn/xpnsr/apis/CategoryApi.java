package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.BadRequestError;
import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.services.CategoryService;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import com.brhn.xpnsr.services.dtos.CustomPagedModel;
import com.brhn.xpnsr.services.dtos.LinksDTO;
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
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for managing categories in the XPNSR application.
 * Provides endpoints for creating, updating, retrieving, and deleting categories.
 */
@CrossOrigin(origins = "*")
@RestController
@Tag(name = "Category API", description = "APIs for managing categories in the XPNSR application.")
@RequestMapping("/api/categories")
@Validated
public class CategoryApi {

    private final CategoryService categoryService;
    private final PagedResourcesAssembler<CategoryDTO> pagedResourcesAssembler;
    private final SchemaGeneratorUtil schemaGeneratorUtil;

    /**
     * Constructs a new CategoryApi instance with the specified CategoryService.
     *
     * @param categoryService         the service for handling category operations
     * @param pagedResourcesAssembler the assembler used for pagination of CategoryDTOs
     * @param schemaGeneratorUtil     the utility for generating JSON schemas
     */
    @Autowired
    public CategoryApi(CategoryService categoryService, PagedResourcesAssembler<CategoryDTO> pagedResourcesAssembler, SchemaGeneratorUtil schemaGeneratorUtil) {
        this.categoryService = categoryService;
        this.pagedResourcesAssembler = pagedResourcesAssembler;
        this.schemaGeneratorUtil = schemaGeneratorUtil;
    }

    /**
     * Adds a new category.
     *
     * @param c the category data transfer object containing category details
     * @return the created category as an entity model wrapped in a response entity
     * @throws BadRequestError if the request is invalid
     */
    @PostMapping("/")
    @Operation(summary = "Create a new category", description = "Adds a new category to the system.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details of the new category",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CategoryDTO.class),
                            examples = @ExampleObject(value = "{\"name\": \"Groceries\", \"parentId\": null}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "201", description = "Category created successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<CategoryDTO>> add(@Valid @RequestBody CategoryDTO c) throws BadRequestError {
        CategoryDTO category = categoryService.add(c);
        EntityModel<CategoryDTO> entityModel = EntityModel.of(category);
        addDetailLinks(entityModel);

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    /**
     * Updates an existing category.
     *
     * @param id the ID of the category to be updated
     * @param c  the category data transfer object containing updated category details
     * @return the updated category as an entity model wrapped in a response entity
     * @throws NotFoundError   if the category with the given ID is not found
     * @throws BadRequestError if the request is invalid
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category", description = "Updates details of an existing category by ID.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated details of the category",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CategoryDTO.class),
                            examples = @ExampleObject(value = "{\"name\": \"Food & Beverages\", \"parentId\": \"groceries\"}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Category updated successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Category not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<CategoryDTO>> update(@PathVariable @Parameter(description = "ID of the category to be updated") String id,
                                                           @Valid @RequestBody CategoryDTO c) throws NotFoundError, BadRequestError {
        CategoryDTO categoryDTO = categoryService.update(id, c);
        EntityModel<CategoryDTO> entityModel = EntityModel.of(categoryDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a category's details by its ID.
     *
     * @param id the ID of the category to retrieve
     * @return the retrieved category as an entity model wrapped in a response entity
     * @throws NotFoundError if the category with the given ID is not found
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a category by ID", description = "Retrieves a category's details by its ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Category found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Category not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<CategoryDTO>> getCategoryById(@PathVariable String id) throws NotFoundError {
        CategoryDTO categoryDTO = categoryService.getCategoryById(id);
        EntityModel<CategoryDTO> entityModel = EntityModel.of(categoryDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a paginated list of all categories.
     *
     * @param pageable the pagination information
     * @return a paginated list of categories as entity models wrapped in a response entity
     */
    @GetMapping("/")
    @Operation(summary = "List all categories", description = "Retrieves a paginated list of all categories.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Categories retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CustomPagedModel.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<CustomPagedModel<CategoryDTO>> getAllCategories(@ParameterObject Pageable pageable) {
        Page<CategoryDTO> categories = categoryService.list(pageable);
        PagedModel<EntityModel<CategoryDTO>> pagedModel = pagedResourcesAssembler.toModel(categories, categoryDTO -> {
            EntityModel<CategoryDTO> entityModel = EntityModel.of(categoryDTO);
            addDetailLinks(entityModel);
            return entityModel;
        });

        CustomPagedModel<CategoryDTO> customPagedModel = new CustomPagedModel<>(pagedModel.getContent(),
                pagedModel.getMetadata());
        customPagedModel.addLinks(pagedModel.getLinks());

        Link addCategoryLink = linkTo(methodOn(CategoryApi.class).add(null)).withRel("add").withType("POST");
        customPagedModel.add(addCategoryLink);

        Link schemaLink = linkTo(methodOn(CategoryApi.class).getCategorySchema()).withRel("schema").withType("GET");
        customPagedModel.add(schemaLink);

        return ResponseEntity.ok(customPagedModel);
    }

    /**
     * Deletes a category by its ID.
     *
     * @param id the ID of the category to delete
     * @return a response entity with no content
     * @throws NotFoundError if the category with the given ID does not exist
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category by ID", description = "Deletes a category by its ID.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Category not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<LinksDTO> delete(@PathVariable @Parameter(description = "ID of the category to delete") String id) throws NotFoundError {
        categoryService.delete(id);

        LinksDTO linksDTO = new LinksDTO();
        linksDTO.add(linkTo(methodOn(CategoryApi.class).getAllCategories(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType("GET"));

        return ResponseEntity.ok(linksDTO);
    }

    /**
     * Adds detailed links to the given EntityModel.
     *
     * @param entityModel The EntityModel to which links are added.
     */
    private void addDetailLinks(EntityModel<CategoryDTO> entityModel) {
        CategoryDTO categoryDTO = entityModel.getContent();
        String categoryId = Objects.requireNonNull(categoryDTO).getId();

        // IANA Links
        entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(categoryId)).withSelfRel().withType("GET"));
        entityModel.add(linkTo(methodOn(CategoryApi.class).getAllCategories(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType(
                "GET"));

        // Control Links
        entityModel.add(linkTo(methodOn(CategoryApi.class).update(categoryId, categoryDTO)).withRel("edit").withType("PUT"));
        entityModel.add(linkTo(methodOn(CategoryApi.class).delete(categoryId)).withRel("delete").withType("DELETE"));
        entityModel.add(linkTo(methodOn(CategoryApi.class).getCategorySchema()).withRel("schema").withType("GET"));
    }

    /**
     * Retrieves the JSON schema for CategoryDTO.
     *
     * @return ResponseEntity containing the JSON schema for CategoryDTO.
     */
    @GetMapping("/schema")
    @Operation(summary = "Get schema for CategoryDTO", description = "Retrieves the JSON schema for CategoryDTO.")
    public ResponseEntity<String> getCategorySchema() {
        String schema = schemaGeneratorUtil.generateSchema(CategoryDTO.class);
        return ResponseEntity.ok(schema);
    }
}
