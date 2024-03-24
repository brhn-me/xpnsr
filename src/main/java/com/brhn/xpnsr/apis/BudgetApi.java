package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.services.BudgetService;
import com.brhn.xpnsr.services.dtos.BudgetDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@Tag(name = "Budget API", description = "The api for managing all budgets of XPNSR")
@RequestMapping("/api/budgets")
public class BudgetApi {

    private final BudgetService budgetService;

    @Autowired
    public BudgetApi(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Add a new budget", description = "Creates a new budget and returns the created budget details",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budget created successfully",
                            content = @Content(schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            })
    public ResponseEntity<EntityModel<BudgetDTO>> createBudget(@RequestBody BudgetDTO budgetDTO) {
        BudgetDTO createdBudget = budgetService.add(budgetDTO);
        EntityModel<BudgetDTO> entityModel = EntityModel.of(createdBudget,
                linkTo(methodOn(BudgetApi.class).getBudgetById(createdBudget.getId())).withSelfRel());

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing budget", description = "Updates the budget details for the given ID and returns the updated budget details",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budget updated successfully",
                            content = @Content(schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "404", description = "Budget not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            })
    public ResponseEntity<EntityModel<BudgetDTO>> updateBudget(@PathVariable Long id, @RequestBody BudgetDTO budgetDTO) {
        BudgetDTO updatedBudget = budgetService.update(id, budgetDTO);
        EntityModel<BudgetDTO> entityModel = EntityModel.of(updatedBudget,
                linkTo(methodOn(BudgetApi.class).getBudgetById(updatedBudget.getId())).withSelfRel(),
                linkTo(methodOn(BudgetApi.class).getAllBudgets(Pageable.unpaged())).withRel("all-budgets"));

        return ResponseEntity.ok(entityModel);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a budget by ID", description = "Returns a single budget details for the given ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budget found",
                            content = @Content(schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "404", description = "Budget not found")
            })
    public ResponseEntity<EntityModel<BudgetDTO>> getBudgetById(@PathVariable Long id) {
        BudgetDTO budgetDTO = budgetService.getBudgetById(id);
        EntityModel<BudgetDTO> entityModel = EntityModel.of(budgetDTO,
                linkTo(methodOn(BudgetApi.class).getBudgetById(id)).withSelfRel(),
                linkTo(methodOn(BudgetApi.class).getAllBudgets(Pageable.unpaged())).withRel("all-budgets"));

        return ResponseEntity.ok(entityModel);
    }

    @GetMapping("/")
    @Operation(summary = "List all budgets", description = "Returns a list of all budgets, with pagination support",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Success",
                            content = @Content(schema = @Schema(implementation = Page.class)))
            })
    public ResponseEntity<Page<EntityModel<BudgetDTO>>> getAllBudgets(Pageable pageable) {
        Page<BudgetDTO> budgetsPage = budgetService.getAllBudgets(pageable);
        Page<EntityModel<BudgetDTO>> entityModelsPage = budgetsPage.map(budgetDTO ->
                EntityModel.of(budgetDTO,
                        linkTo(methodOn(BudgetApi.class).getBudgetById(budgetDTO.getId())).withRel("budget"),
                        linkTo(methodOn(BudgetApi.class).getAllBudgets(pageable)).withSelfRel()
                )
        );

        return ResponseEntity.ok(entityModelsPage);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget", description = "Deletes a budget for the given ID",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Budget deleted"),
                    @ApiResponse(responseCode = "404", description = "Budget not found")
            })
    public ResponseEntity<Void> delete(@Parameter(description = "ID of the budget to delete") @PathVariable Long id) throws NotFoundError {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
