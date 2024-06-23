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
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for managing transactions in the XPNSR application.
 * Provides endpoints for creating, updating, retrieving, and deleting transactions.
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
     * Creates a new transaction.
     *
     * @param t the transaction data transfer object containing transaction details
     * @return the created transaction as an entity model wrapped in a response entity
     */
    @PostMapping("/")
    @Operation(summary = "Create a new transaction", description = "Adds a new transaction to the system.",
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
        EntityModel<TransactionDTO> entityModel = EntityModel.of(transactionDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    /**
     * Updates an existing transaction by ID.
     *
     * @param id the ID of the transaction to be updated
     * @param t  the transaction data transfer object containing updated transaction details
     * @return ResponseEntity containing the updated transaction
     * @throws NotFoundError if the transaction with the specified ID is not found
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing transaction", description = "Updates details of an existing transaction by ID.",
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
        TransactionDTO updatedTransaction = transactionService.update(id, t);
        EntityModel<TransactionDTO> entityModel = EntityModel.of(updatedTransaction);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a transaction by ID.
     *
     * @param id the ID of the transaction to retrieve
     * @return ResponseEntity containing the retrieved transaction
     * @throws NotFoundError if the transaction with the specified ID is not found
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a transaction by ID", description = "Retrieves a transaction's details by its ID.",
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
        EntityModel<TransactionDTO> entityModel = EntityModel.of(transactionDTO);
        addDetailLinks(entityModel);

        return ResponseEntity.ok(entityModel);
    }

    /**
     * Retrieves a paginated list of all transactions.
     *
     * @param pageable the pagination information
     * @return ResponseEntity containing a paginated list of TransactionDTOs
     */
    @GetMapping("/")
    @Operation(summary = "List all transactions", description = "Retrieves a paginated list of all transactions.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transactions retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CustomPagedModel.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<CustomPagedModel<TransactionDTO>> getAll(@ParameterObject Pageable pageable) {
        Page<TransactionDTO> transactionsPage = transactionService.getAll(pageable);
        PagedModel<EntityModel<TransactionDTO>> pagedModel = pagedResourcesAssembler.toModel(transactionsPage, transactionDTO -> {
            EntityModel<TransactionDTO> entityModel = EntityModel.of(transactionDTO);
            addDetailLinks(entityModel);
            return entityModel;
        });

        CustomPagedModel<TransactionDTO> customPagedModel = new CustomPagedModel<>(pagedModel.getContent(),
                pagedModel.getMetadata());
        customPagedModel.addLinks(pagedModel.getLinks());

        Link addTransactionLink = linkTo(methodOn(TransactionApi.class).add(null)).withRel("add").withType("POST");
        customPagedModel.add(addTransactionLink);

        return ResponseEntity.ok(customPagedModel);
    }

    /**
     * Deletes a transaction by its ID.
     *
     * @param id the ID of the transaction to delete
     * @return ResponseEntity containing links to the list of transactions
     * @throws NotFoundError if the transaction with the given ID is not found
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction", description = "Deletes a transaction by its ID.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Transaction deleted successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized access"),
                    @ApiResponse(responseCode = "404", description = "Transaction not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<LinksDTO> delete(@PathVariable @Parameter(description = "ID of the transaction to delete") Long id) throws NotFoundError {
        transactionService.delete(id);

        LinksDTO linksDTO = new LinksDTO();
        linksDTO.add(linkTo(methodOn(TransactionApi.class).getAll(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType("GET"));

        return ResponseEntity.ok(linksDTO);
    }

    /**
     * Adds detailed links to the given EntityModel.
     *
     * @param entityModel The EntityModel to which links are added.
     */
    private void addDetailLinks(EntityModel<TransactionDTO> entityModel) {
        TransactionDTO transactionDTO = entityModel.getContent();
        Long transactionId = Objects.requireNonNull(transactionDTO).getId();
        // IANA Links
        entityModel.add(linkTo(methodOn(TransactionApi.class).get(transactionId)).withSelfRel().withType("GET"));
        entityModel.add(linkTo(methodOn(TransactionApi.class).getAll(Pageable.unpaged())).withRel(IanaLinkRelations.COLLECTION).withType("GET"));
        entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(transactionDTO.getPrimaryCategoryId())).withRel("primaryCategory").withType("GET"));
        entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(transactionDTO.getSecondaryCategoryId())).withRel("secondaryCategory").withType("GET"));

        // Control Links
        entityModel.add(linkTo(methodOn(TransactionApi.class).update(transactionId, transactionDTO)).withRel("edit").withType("PUT"));
        entityModel.add(linkTo(methodOn(TransactionApi.class).delete(transactionId)).withRel("delete").withType("DELETE"));
    }
}
