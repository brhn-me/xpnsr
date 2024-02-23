package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.services.TransactionService;
import com.brhn.xpnsr.services.dtos.TransactionDTO;
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
@Tag(name = "Transaction API", description = "The api for managing all transactions of XPNSR")
@RequestMapping("/api/transactions")
public class TransactionApi {

    private final TransactionService transactionService;

    @Autowired
    public TransactionApi(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @Operation(summary = "Add a new transaction", responses = {
            @ApiResponse(responseCode = "200", description = "Transaction added successfully",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid transaction data provided")})
    @PostMapping
    public ResponseEntity<TransactionDTO> add(@RequestBody TransactionDTO t) {
        TransactionDTO transactionDTO = transactionService.add(t);
        return ResponseEntity.ok(transactionDTO);
    }

    @Operation(summary = "Update an existing transaction", responses = {
            @ApiResponse(responseCode = "200", description = "Transaction updated successfully",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Transaction not found"),
            @ApiResponse(responseCode = "400", description = "Invalid transaction data provided")})
    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> update(@PathVariable Long id, @RequestBody TransactionDTO t) {
        TransactionDTO transactionDTO = transactionService.update(id, t);
        return ResponseEntity.ok(transactionDTO);
    }

    @Operation(summary = "Get a transaction by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Transaction found",
                    content = @Content(schema = @Schema(implementation = TransactionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Transaction not found")})
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> get(@PathVariable Long id) throws NotFoundError {
        TransactionDTO transactionDTO = transactionService.get(id);
        return ResponseEntity.ok(transactionDTO);
    }

    @Operation(summary = "Get all transactions with pagination", responses = {
            @ApiResponse(responseCode = "200", description = "List of transactions",
                    content = @Content(schema = @Schema(implementation = Page.class)))})
    @GetMapping("/")
    public ResponseEntity<Page<TransactionDTO>> getAll(@ParameterObject Pageable pageable) {
        Page<TransactionDTO> transactions = transactionService.getAll(pageable);
        return ResponseEntity.ok().body(transactions);
    }

    @Operation(summary = "Delete a transaction by ID", responses = {
            @ApiResponse(responseCode = "204", description = "Transaction deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws NotFoundError {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
