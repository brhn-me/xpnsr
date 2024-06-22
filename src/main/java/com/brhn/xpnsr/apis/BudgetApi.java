package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Budget;
import com.brhn.xpnsr.services.BudgetService;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
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
import org.springframework.hateoas.PagedModel;
import org.springframework.hateoas.Link;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for managing budgets in the XPNSR application.
 * Provides endpoints for creating, updating, retrieving, and deleting budgets.
 */
@CrossOrigin(origins = "*")
@RestController
@Tag(name = "Budget API", description = "The API for managing all budgets of XPNSR")
@RequestMapping("/api/budgets")
@Validated
public class BudgetApi {

    private final BudgetService budgetService;
    private final PagedResourcesAssembler<BudgetDTO> pagedResourcesAssembler;
    private final SchemaGeneratorUtil schemaGeneratorUtil;

    /**
     * Constructor for BudgetApi.
     *
     * @param budgetService           The service used to manage budgets.
     * @param pagedResourcesAssembler The assembler used for pagination of BudgetDTOs.
     * @param schemaGeneratorUtil     The utility for generating JSON schemas.
     */
    @Autowired
    public BudgetApi(BudgetService budgetService, PagedResourcesAssembler<BudgetDTO> pagedResourcesAssembler, SchemaGeneratorUtil schemaGeneratorUtil) {
        this.budgetService = budgetService;
        this.pagedResourcesAssembler = pagedResourcesAssembler;
        this.schemaGeneratorUtil = schemaGeneratorUtil;
    }

    /**
     * Creates a new budget.
     *
     * @param budgetDTO The BudgetDTO containing the details of the new budget.
     * @return ResponseEntity containing the created BudgetDTO.
     */
    @PostMapping("/")
    @Operation(summary = "Create a new budget", description = "Adds a new budget to the system.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details of the new budget",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BudgetDTO.class),
                            examples = @ExampleObject(value = "{\"title\": \"Monthly Groceries\", \"amount\": 500.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "201", description = "Budget created successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Category or user not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<BudgetDTO>> createBudget(@Valid @RequestBody BudgetDTO budgetDTO) {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);
        EntityModel<BudgetDTO> entityModel = EntityModel.of(createdBudget);
        addDetailLinks(entityModel);

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    /**
     * Updates an existing budget by ID.
     *
     * @param id        The ID of the budget to be updated.
     * @param budgetDTO The BudgetDTO containing the updated details of the budget.
     * @return ResponseEntity containing the updated BudgetDTO.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing budget", description = "Updates details of an existing budget by ID.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated details of the budget",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BudgetDTO.class),
                            examples = @ExampleObject(value = "{\"title\": \"Monthly Groceries\", \"amount\": 600.00, \"currency\": \"USD\", \"categoryId\": \"groceries\", \"userId\": 1}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budget updated successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Budget or category or user not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<BudgetDTO>> updateBudget(@PathVariable @Parameter(description = "ID of the budget to be updated") Long id,
                                                               @Valid @RequestBody BudgetDTO budgetDTO) {
        BudgetDTO updatedBudget = budgetService.update(id, budgetDTO);
        EntityModel<BudgetDTO> entityModel = EntityModel.of(updatedBudget);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a budget by ID.
     *
     * @param id The ID of the budget to retrieve.
     * @return ResponseEntity containing the retrieved BudgetDTO.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a budget by ID", description = "Retrieves a budget's details by its ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budget found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Budget not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<BudgetDTO>> getBudgetById(@PathVariable Long id) {
        BudgetDTO budgetDTO = budgetService.getBudgetById(id);
        EntityModel<BudgetDTO> entityModel = EntityModel.of(budgetDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a paginated list of all budgets.
     *
     * @param pageable The pagination information.
     * @return ResponseEntity containing a paginated list of BudgetDTOs.
     */
    @GetMapping("/")
    @Operation(summary = "List all budgets", description = "Retrieves a paginated list of all budgets.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budgets retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CustomPagedModel.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<CustomPagedModel<BudgetDTO>> getAllBudgets(@ParameterObject Pageable pageable) {
        Page<BudgetDTO> budgetsPage = budgetService.getAllBudgets(pageable);
        PagedModel<EntityModel<BudgetDTO>> pagedModel = pagedResourcesAssembler.toModel(budgetsPage, budgetDTO -> {
            EntityModel<BudgetDTO> entityModel = EntityModel.of(budgetDTO);
            addDetailLinks(entityModel);
            return entityModel;
        });

        CustomPagedModel<BudgetDTO> customPagedModel = new CustomPagedModel<>(pagedModel.getContent(),
                pagedModel.getMetadata());
        customPagedModel.addLinks(pagedModel.getLinks());

        Link addBudgetLink = linkTo(methodOn(BudgetApi.class).createBudget(null)).withRel("add").withType("POST");
        customPagedModel.add(addBudgetLink);

        Link schemaLink = linkTo(methodOn(BudgetApi.class).getBudgetSchema()).withRel("schema").withType("GET");
        customPagedModel.add(schemaLink);

        return ResponseEntity.ok(customPagedModel);
    }

    /**
     * Deletes a budget by its ID.
     *
     * @param id The ID of the budget to delete.
     * @return ResponseEntity containing links to the list of budgets.
     * @throws NotFoundError if the budget is not found.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget", description = "Deletes a budget by its ID.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Budget deleted successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Budget not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<LinksDTO> deleteBudget(@PathVariable @Parameter(description = "ID of the budget to delete") Long id) throws NotFoundError {
        budgetService.delete(id);

        LinksDTO linksDTO = new LinksDTO();
        linksDTO.add(linkTo(methodOn(BudgetApi.class).getAllBudgets(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType("GET"));

        return ResponseEntity.ok(linksDTO);
    }

    /**
     * Adds detailed links to the given EntityModel.
     *
     * @param entityModel The EntityModel to which links are added.
     */
    private void addDetailLinks(EntityModel<BudgetDTO> entityModel) {
        BudgetDTO budgetDTO = entityModel.getContent();
        Long budgetId = Objects.requireNonNull(budgetDTO).getId();

        // IANA Links
        entityModel.add(linkTo(methodOn(BudgetApi.class).getBudgetById(budgetId)).withSelfRel().withType("GET"));
        entityModel.add(linkTo(methodOn(BudgetApi.class).getAllBudgets(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType("GET"));
        entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(budgetDTO.getCategoryId())).withRel("category").withType("GET"));

        // Control Links
        entityModel.add(linkTo(methodOn(BudgetApi.class).updateBudget(budgetId, budgetDTO)).withRel("edit").withType("PUT"));
        entityModel.add(linkTo(methodOn(BudgetApi.class).deleteBudget(budgetId)).withRel("delete").withType("DELETE"));
        entityModel.add(linkTo(methodOn(BudgetApi.class).getBudgetSchema()).withRel("schema").withType("GET"));
    }

    /**
     * Retrieves the JSON schema for BudgetDTO.
     *
     * @return ResponseEntity containing the JSON schema for BudgetDTO.
     */
    @GetMapping("/schema")
    @Operation(summary = "Get schema for BudgetDTO", description = "Retrieves the JSON schema for BudgetDTO.")
    public ResponseEntity<String> getBudgetSchema() {
        String schema = schemaGeneratorUtil.generateSchema(BudgetDTO.class);
        return ResponseEntity.ok(schema);
    }
}
