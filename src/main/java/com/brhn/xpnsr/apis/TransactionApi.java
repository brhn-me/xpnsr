package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.services.TransactionService;
import com.brhn.xpnsr.services.dtos.CustomPagedModel;
import com.brhn.xpnsr.services.dtos.LinksDTO;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
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
 * REST controller for managing transactions in the XPNSR application.
 * Provides endpoints for adding, updating, retrieving, listing, and deleting transactions.
 */
@CrossOrigin(origins = "*")
@RestController
@Tag(name = "Transaction API", description = "APIs for managing all transactions of XPNSR")
@RequestMapping("/api/transactions")
@Validated
public class TransactionApi {

    private final TransactionService transactionService;
    private final PagedResourcesAssembler<TransactionDTO> pagedResourcesAssembler;

    /**
     * Constructs a new TransactionApi instance with the specified TransactionService.
     *
     * @param transactionService      the service for handling transaction operations
     * @param pagedResourcesAssembler the assembler used for pagination of TransactionDTOs
     */
    @Autowired
    public TransactionApi(TransactionService transactionService, PagedResourcesAssembler<TransactionDTO> pagedResourcesAssembler) {
        this.transactionService = transactionService;
        this.pagedResourcesAssembler = pagedResourcesAssembler;
    }

    /**
     * Endpoint to add a new transaction.
     *
     * @param t the transaction data to be added
     * @return ResponseEntity containing the added transaction with hypermedia links
     */
    @PostMapping("/")
    @Operation(summary = "Add a new transaction", description = "Creates a new transaction and returns the created transaction details",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details of the new transaction",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TransactionDTO.class),
                            examples = @ExampleObject(value = "{\"date\": \"2024-06-20T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 100.00, \"due\": 0.00, \"title\": \"Grocery Shopping\", \"currency\": \"USD\", \"city\": \"New York\", \"country\": \"USA\", \"description\": \"Bought groceries from supermarket\", \"tags\": \"grocery, food\", \"primaryCategoryId\": \"groceries\", \"secondaryCategoryId\": \"food\", \"userId\": 1}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "201", description = "Transaction created successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = TransactionDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<TransactionDTO>> add(@Valid @RequestBody TransactionDTO t) {
        TransactionDTO transactionDTO = transactionService.add(t);
        EntityModel<TransactionDTO> entityModel = getWithHyperMediaLinks(transactionDTO);

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    /**
     * Endpoint to update an existing transaction.
     *
     * @param id the ID of the transaction to update
     * @param t  the updated transaction data
     * @return ResponseEntity containing the updated transaction with hypermedia links
     * @throws NotFoundError if the transaction with the specified ID is not found
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing transaction", description = "Updates the transaction details for the given ID and returns the updated transaction details",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated details of the transaction",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TransactionDTO.class),
                            examples = @ExampleObject(value = "{\"date\": \"2024-06-21T12:34:56.789Z\", \"type\": \"EXPENSE\", \"amount\": 150.00, \"due\": 0.00, \"title\": \"Restaurant Bill\", \"currency\": \"USD\", \"city\": \"Los Angeles\", \"country\": \"USA\", \"description\": \"Dinner at a restaurant\", \"tags\": \"dinner, restaurant\", \"primaryCategoryId\": \"dining\", \"secondaryCategoryId\": \"food\", \"userId\": 1}")
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transaction updated successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = TransactionDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Transaction not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<TransactionDTO>> update(@PathVariable @Parameter(description = "ID of the transaction to be updated") Long id,
                                                              @Valid @RequestBody TransactionDTO t) throws NotFoundError {
        TransactionDTO transactionDTO = transactionService.update(id, t);
        EntityModel<TransactionDTO> entityModel = getWithHyperMediaLinks(transactionDTO);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Endpoint to retrieve a transaction by ID.
     *
     * @param id the ID of the transaction to retrieve
     * @return ResponseEntity containing the retrieved transaction with hypermedia links
     * @throws NotFoundError if the transaction with the specified ID is not found
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a transaction by ID", description = "Returns a single transaction details for the given ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transaction found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = TransactionDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Transaction not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<EntityModel<TransactionDTO>> get(@PathVariable Long id) throws NotFoundError {
        TransactionDTO transactionDTO = transactionService.get(id);
        EntityModel<TransactionDTO> entityModel = getWithHyperMediaLinks(transactionDTO);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Endpoint to retrieve all transactions with pagination.
     *
     * @param pageable pagination information
     * @return ResponseEntity containing a page of transactions with hypermedia links
     */
    @GetMapping("/")
    @Operation(summary = "Get all transactions with pagination", description = "Returns a list of all transactions, with pagination support",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transactions retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CustomPagedModel.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<CustomPagedModel<TransactionDTO>> getAll(@ParameterObject Pageable pageable) {
        Page<TransactionDTO> transactions = transactionService.getAll(pageable);
        PagedModel<EntityModel<TransactionDTO>> pagedModel = pagedResourcesAssembler.toModel(transactions, this::getWithHyperMediaLinks);

        CustomPagedModel<TransactionDTO> customPagedModel = new CustomPagedModel<>(pagedModel.getContent(), pagedModel.getMetadata());
        customPagedModel.addLinks(pagedModel.getLinks());

        return ResponseEntity.ok(customPagedModel);
    }

    /**
     * Endpoint to delete a transaction by ID.
     *
     * @param id the ID of the transaction to delete
     * @return ResponseEntity indicating the success of the deletion operation
     * @throws NotFoundError if the transaction with the specified ID is not found
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction by ID", description = "Deletes a transaction for the given ID",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Transaction deleted successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Transaction not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<LinksDTO> delete(@PathVariable @Parameter(description = "ID of the transaction to delete") Long id) throws NotFoundError {
        transactionService.delete(id);

        LinksDTO linksDTO = new LinksDTO();
        linksDTO.add(linkTo(methodOn(TransactionApi.class).getAll(Pageable.unpaged())).withRel("transactions"));

        return ResponseEntity.ok(linksDTO);
    }

    /**
     * Helper method to add hypermedia links to a TransactionDTO.
     *
     * @param transactionDTO the transaction DTO to enrich with hypermedia links
     * @return EntityModel containing the transaction DTO with hypermedia links
     */
    private EntityModel<TransactionDTO> getWithHyperMediaLinks(TransactionDTO transactionDTO) {
        EntityModel<TransactionDTO> entityModel = EntityModel.of(transactionDTO);

        // Self link
        entityModel.add(linkTo(methodOn(TransactionApi.class).get(transactionDTO.getId())).withSelfRel());

        // Edit link
        entityModel.add(linkTo(methodOn(TransactionApi.class).update(transactionDTO.getId(), transactionDTO)).withRel("edit"));

        // Delete link
        entityModel.add(linkTo(methodOn(TransactionApi.class).delete(transactionDTO.getId())).withRel("delete"));

        // Link to primary category (if exists)
        if (transactionDTO.getPrimaryCategoryId() != null) {
            entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(transactionDTO.getPrimaryCategoryId()))
                    .withRel("primaryCategory"));
        }

        // Link to secondary category (if exists)
        if (transactionDTO.getSecondaryCategoryId() != null) {
            entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(transactionDTO.getSecondaryCategoryId()))
                    .withRel("secondaryCategory"));
        }

        // Link to retrieve all transactions
        entityModel.add(linkTo(methodOn(TransactionApi.class).getAll(Pageable.unpaged())).withRel("transactions"));

        return entityModel;
    }
}
