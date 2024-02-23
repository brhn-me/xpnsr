package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Budget;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<BudgetDTO> add(@RequestBody BudgetDTO b) {
        BudgetDTO budgetDTO = budgetService.add(b);
        return ResponseEntity.ok(budgetDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing budget", description = "Updates the budget details for the given ID and returns the updated budget details",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budget updated successfully",
                            content = @Content(schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "404", description = "Budget not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            })
    public ResponseEntity<BudgetDTO> update(@PathVariable Long id, @RequestBody BudgetDTO b) {
        BudgetDTO budgetDTO = budgetService.update(id, b);
        return ResponseEntity.ok(budgetDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a budget by ID", description = "Returns a single budget details for the given ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Budget found",
                            content = @Content(schema = @Schema(implementation = BudgetDTO.class))),
                    @ApiResponse(responseCode = "404", description = "Budget not found")
            })
    public ResponseEntity<BudgetDTO> getBudgetById(
            @Parameter(description = "ID of the budget to return")
            @PathVariable Long id) throws NotFoundError {
        BudgetDTO budgetDTO = budgetService.getBudgetById(id);
        return ResponseEntity.ok(budgetDTO);
    }

    @GetMapping("/")
    @Operation(summary = "List all budgets", description = "Returns a list of all budgets, with pagination support",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Success",
                            content = @Content(schema = @Schema(implementation = Page.class)))
            })
    public ResponseEntity<Page<BudgetDTO>> getAllBudgets(@ParameterObject Pageable pageable) {
        Page<BudgetDTO> budgets = budgetService.getAllBudgets(pageable);
        return ResponseEntity.ok().body(budgets);
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
