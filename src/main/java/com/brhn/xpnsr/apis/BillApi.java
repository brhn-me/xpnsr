package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.services.BillService;
import com.brhn.xpnsr.services.dtos.BillDTO;
import com.brhn.xpnsr.services.dtos.LinksDTO;
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
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for managing bills in the XPNSR application.
 * Provides endpoints for creating, updating, retrieving, and deleting bills.
 */
@CrossOrigin(origins = "*")
@RestController
@Tag(name = "Bill API", description = "The API for managing all bills of XPNSR")
@RequestMapping("/api/bills")
@Validated
public class BillApi {

    private final BillService billService;
    private final PagedResourcesAssembler<BillDTO> pagedResourcesAssembler;

    /**
     * Constructs a new BillApi instance with the specified BillService and PagedResourcesAssembler.
     *
     * @param billService             the service for handling bill operations
     * @param pagedResourcesAssembler the assembler for handling paginated resources
     */
    @Autowired
    public BillApi(BillService billService, PagedResourcesAssembler<BillDTO> pagedResourcesAssembler) {
        this.billService = billService;
        this.pagedResourcesAssembler = pagedResourcesAssembler;
    }

    /**
     * Creates a new bill.
     *
     * @param b the bill data transfer object containing bill details
     * @return the created bill as an entity model wrapped in a response entity
     */
    @PostMapping("/")
    @Operation(summary = "Create a new bill", description = "Adds a new bill to the system.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details of the new bill",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BillDTO.class),
                            examples = @ExampleObject(value = "{\"tenure\": 12, \"amount\": 100.00, \"categoryId\": " +
                                    "\"groceries\"}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "201", description = "Bill created successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Category not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<BillDTO>> createBill(@Valid @RequestBody BillDTO b) {
        BillDTO billDTO = billService.createBill(b);
        EntityModel<BillDTO> entityModel = EntityModel.of(billDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    /**
     * Updates an existing bill.
     *
     * @param id   the ID of the bill to be updated
     * @param bill the bill data transfer object containing updated bill details
     * @return the updated bill as an entity model wrapped in a response entity
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing bill", description = "Updates details of an existing bill by ID.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated details of the bill",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BillDTO.class),
                            examples = @ExampleObject(value = "{\"tenure\": 12, \"amount\": 150.00, \"categoryId\": " +
                                    "\"groceries\"}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill updated successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Bill or category not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<BillDTO>> updateBill(@PathVariable @Parameter(description = "ID of the bill to be updated") Long id,
                                                           @Valid @RequestBody BillDTO bill) {
        BillDTO updatedBill = billService.updateBill(id, bill);

        EntityModel<BillDTO> entityModel = EntityModel.of(updatedBill);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a bill's details by its ID.
     *
     * @param id the ID of the bill to retrieve
     * @return the retrieved bill as an entity model wrapped in a response entity
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a bill by ID", description = "Retrieves a bill's details by its ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Bill not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<BillDTO>> getBillById(@PathVariable Long id) {
        BillDTO billDTO = billService.getBillById(id);

        EntityModel<BillDTO> entityModel = EntityModel.of(billDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a paginated list of all bills.
     *
     * @param pageable the pagination information
     * @return a paginated list of bills as entity models wrapped in a response entity
     */
    @GetMapping("/")
    @Operation(summary = "List all bills", description = "Retrieves a paginated list of all bills.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bills retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = PagedModel.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<PagedModel<EntityModel<BillDTO>>> getAllBills(@ParameterObject Pageable pageable) {
        Page<BillDTO> billsPage = billService.getAllBills(pageable);
        PagedModel<EntityModel<BillDTO>> pagedModel = pagedResourcesAssembler.toModel(billsPage, billDTO -> {
            EntityModel<BillDTO> entityModel = EntityModel.of(billDTO);
            addDetailLinks(entityModel);
            return entityModel;
        });

        return ResponseEntity.ok(pagedModel);
    }

    /**
     * Deletes a bill by its ID.
     *
     * @param id the ID of the bill to delete
     * @return a response entity with links
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bill", description = "Deletes a bill by its ID.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Bill deleted successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Bill not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<LinksDTO> deleteBill(@PathVariable @Parameter(description = "ID of the bill to delete") Long id) {
        billService.deleteBill(id);

        LinksDTO linksDTO = new LinksDTO();
        linksDTO.add(linkTo(methodOn(BillApi.class).getAllBills(Pageable.unpaged())).withRel("bills"));

        return ResponseEntity.ok(linksDTO);
    }

    /**
     * Helper method to add hypermedia links to a BillDTO entity model for detail views.
     *
     * @param entityModel the entity model to add links to
     */
    private void addDetailLinks(EntityModel<BillDTO> entityModel) {
        BillDTO billDTO = entityModel.getContent();
        entityModel.add(linkTo(methodOn(BillApi.class).getBillById(Objects.requireNonNull(billDTO).getId())).withSelfRel());
        entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(billDTO.getCategoryId())).withRel("category"));
    }
}