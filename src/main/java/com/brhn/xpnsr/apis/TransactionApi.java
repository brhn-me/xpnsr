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
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Bean;
@CrossOrigin(origins = "*")
@RestController
@Tag(name = "Transaction API", description = "The api for managing all transactions of XPNSR")
@RequestMapping("/api/transactions")
public class TransactionApi {

    private final TransactionService transactionService;

    @Autowired


    public TransactionApi(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
//    // CORS Configuration
//    @Bean
//    public WebMvcConfigurer corsConfigurer() {
//        return new WebMvcConfigurer() {
//            @Override
//            public void addCorsMappings(CorsRegistry registry) {
//                registry.addMapping("/**")
//                        .allowedOrigins("*")
//                        .allowedMethods("POST", "GET", "DELETE","PUT"); // Specify allowed methods
//            }
//        };
//    }
    @Operation(summary = "Add a new transaction", responses = {@ApiResponse(responseCode = "200", description = "Transaction added successfully", content = @Content(schema = @Schema(implementation = TransactionDTO.class))), @ApiResponse(responseCode = "400", description = "Invalid transaction data provided")})
    @PostMapping("/")


    public ResponseEntity<EntityModel<TransactionDTO>> add(@RequestBody TransactionDTO t) {
        TransactionDTO transactionDTO = transactionService.add(t);
        EntityModel<TransactionDTO> entityModel = getWithHyperMediaLinks(transactionDTO);

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    @Operation(summary = "Update an existing transaction", responses = {@ApiResponse(responseCode = "200", description = "Transaction updated successfully", content = @Content(schema = @Schema(implementation = TransactionDTO.class))), @ApiResponse(responseCode = "404", description = "Transaction not found"), @ApiResponse(responseCode = "400", description = "Invalid transaction data provided")})
    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<TransactionDTO>> update(@PathVariable Long id, @RequestBody TransactionDTO t) {
        TransactionDTO transactionDTO = transactionService.update(id, t);
        EntityModel<TransactionDTO> entityModel = getWithHyperMediaLinks(transactionDTO);

        return ResponseEntity.ok(entityModel);
    }

    @Operation(summary = "Get a transaction by ID", responses = {@ApiResponse(responseCode = "200", description = "Transaction found", content = @Content(schema = @Schema(implementation = TransactionDTO.class))), @ApiResponse(responseCode = "404", description = "Transaction not found")})
    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<TransactionDTO>> get(@PathVariable Long id) throws NotFoundError {
        TransactionDTO transactionDTO = transactionService.get(id);
        EntityModel<TransactionDTO> entityModel = getWithHyperMediaLinks(transactionDTO);

        return ResponseEntity.ok(entityModel);
    }

    @Operation(summary = "Get all transactions with pagination", responses = {@ApiResponse(responseCode = "200", description = "List of transactions", content = @Content(schema = @Schema(implementation = Page.class)))})
    @GetMapping("/")
    public ResponseEntity<Page<EntityModel<TransactionDTO>>> getAll(@ParameterObject Pageable pageable) {
        Page<TransactionDTO> transactions = transactionService.getAll(pageable);
        Page<EntityModel<TransactionDTO>> page = transactions.map(this::getWithHyperMediaLinks);

        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Delete a transaction by ID", responses = {@ApiResponse(responseCode = "204", description = "Transaction deleted successfully"), @ApiResponse(responseCode = "404", description = "Transaction not found")})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws NotFoundError {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private EntityModel<TransactionDTO> getWithHyperMediaLinks(TransactionDTO transactionDTO) {
        EntityModel<TransactionDTO> entityModel = EntityModel.of(transactionDTO);

        // Self link
        entityModel.add(linkTo(methodOn(TransactionApi.class).get(transactionDTO.getId())).withSelfRel());

        if (transactionDTO.getPrimaryCategoryId() != null) {
            entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(transactionDTO.getPrimaryCategoryId())).withRel(
                    "primaryCategory"));
        }
        if (transactionDTO.getSecondaryCategoryId() != null) {
            entityModel.add(linkTo(methodOn(CategoryApi.class).getCategoryById(transactionDTO.getSecondaryCategoryId())).withRel(
                    "secondaryCategory"));
        }
        entityModel.add(linkTo(methodOn(TransactionApi.class).getAll(Pageable.unpaged())).withRel("all-transactions"));

        return entityModel;
    }
}
