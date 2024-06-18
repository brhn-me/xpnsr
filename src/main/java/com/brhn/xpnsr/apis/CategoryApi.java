package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.BadRequestError;
import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.services.CategoryService;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for managing categories in the XPNSR application.
 * Provides endpoints for creating, updating, retrieving, and deleting categories.
 */
@RestController
@Tag(name = "Category API", description = "APIs for managing categories in the XPNSR application.")
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryApi {

    private final CategoryService categoryService;

    /**
     * Constructs a new CategoryApi instance with the specified CategoryService.
     *
     * @param categoryService the service for handling category operations
     */
    public CategoryApi(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Adds a new category.
     *
     * @param c the category data transfer object containing category details
     * @return the created category as an entity model wrapped in a response entity
     * @throws BadRequestError if the request is invalid
     */
    @Operation(summary = "Add a new category", responses = {
            @ApiResponse(description = "Category added successfully",
                    responseCode = "200", content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
            @ApiResponse(description = "Bad Request", responseCode = "400")})
    @PostMapping
    public ResponseEntity<EntityModel<CategoryDTO>> add(@RequestBody CategoryDTO c) throws BadRequestError {
        CategoryDTO category = categoryService.add(c);
        EntityModel<CategoryDTO> entityModel = EntityModel.of(category,
                linkTo(methodOn(CategoryApi.class).getCategoryById(category.getId())).withSelfRel());

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    /**
     * Updates an existing category.
     *
     * @param id the ID of the category to be updated
     * @param c the category data transfer object containing updated category details
     * @return the updated category as an entity model wrapped in a response entity
     * @throws NotFoundError if the category with the given ID is not found
     * @throws BadRequestError if the request is invalid
     */
    @Operation(summary = "Update an existing category", responses = {
            @ApiResponse(description = "Category updated successfully",
                    responseCode = "200", content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
            @ApiResponse(description = "Category not found", responseCode = "404"),
            @ApiResponse(description = "Parent category not found", responseCode = "400")})
    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<CategoryDTO>> update(@PathVariable String id, @RequestBody CategoryDTO c) throws NotFoundError, BadRequestError {
        CategoryDTO categoryDTO = categoryService.update(id, c);
        EntityModel<CategoryDTO> entityModel = EntityModel.of(categoryDTO,
                linkTo(methodOn(CategoryApi.class).getCategoryById(categoryDTO.getId())).withSelfRel(),
                linkTo(methodOn(CategoryApi.class).getAllCategories(Pageable.unpaged())).withRel("all-categories"));

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a category's details by its ID.
     *
     * @param id the ID of the category to retrieve
     * @return the retrieved category as an entity model wrapped in a response entity
     * @throws NotFoundError if the category with the given ID is not found
     */
    @Operation(summary = "Get a category by ID", responses = {
            @ApiResponse(description = "Category found", responseCode = "200",
                    content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
            @ApiResponse(description = "Category not found", responseCode = "404")})
    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<CategoryDTO>> getCategoryById(@PathVariable String id) throws NotFoundError {
        CategoryDTO categoryDTO = categoryService.getCategoryById(id);
        EntityModel<CategoryDTO> entityModel = EntityModel.of(categoryDTO,
                linkTo(methodOn(CategoryApi.class).getCategoryById(id)).withSelfRel(),
                linkTo(methodOn(CategoryApi.class).getAllCategories(Pageable.unpaged())).withRel("all-categories"));

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a paginated list of all categories.
     *
     * @param pageable the pagination information
     * @return a paginated list of categories as entity models wrapped in a response entity
     */
    @Operation(summary = "Get all categories", responses = {
            @ApiResponse(description = "List of categories", responseCode = "200",
                    content = @Content(schema = @Schema(implementation = Page.class)))})
    @GetMapping("/")
    public ResponseEntity<Page<EntityModel<CategoryDTO>>> getAllCategories(@ParameterObject Pageable pageable) {
        Page<CategoryDTO> categories = categoryService.list(pageable);
        Page<EntityModel<CategoryDTO>> entityModelsPage = categories.map(categoryDTO ->
                EntityModel.of(categoryDTO,
                        linkTo(methodOn(CategoryApi.class).getCategoryById(categoryDTO.getId())).withRel("category"),
                        linkTo(methodOn(CategoryApi.class).getAllCategories(pageable)).withSelfRel()
                )
        );

        return ResponseEntity.ok(entityModelsPage);
    }

    /**
     * Deletes a category by its ID.
     *
     * @param id the ID of the category to delete
     * @return a response entity with no content
     * @throws NotFoundError if the category with the given ID does not exist
     */
    @Operation(summary = "Delete a category by ID", responses = {
            @ApiResponse(description = "Category deleted successfully", responseCode = "204"),
            @ApiResponse(description = "Category not found", responseCode = "404")})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) throws NotFoundError {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}