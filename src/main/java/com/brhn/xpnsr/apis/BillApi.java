package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.services.BillService;
import com.brhn.xpnsr.services.dtos.BillDTO;
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
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Bean;
@CrossOrigin(origins = "*")
@RestController

@Tag(name = "Bill API", description = "The api for managing all bills of XPNSR")
@RequestMapping("/api/bills")

public class BillApi {

    private final BillService billService;


    @Autowired
    public BillApi(BillService billService) {
        this.billService = billService;
    }

    // CORS Configuration
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

    @PostMapping("/")
    @Operation(summary = "Create a new bill", description = "Adds a new bill to the system.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill created",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class)))
            })
    public ResponseEntity<EntityModel<BillDTO>> createBill(@RequestBody BillDTO b) {
        BillDTO billDTO = billService.createBill(b);
        EntityModel<BillDTO> entityModel = EntityModel.of(billDTO,
                linkTo(methodOn(BillApi.class).getBillById(billDTO.getId())).withSelfRel());

        return ResponseEntity.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri()).body(entityModel);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing bill", description = "Updates details of an existing bill by ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill updated",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class)))
            })
    public ResponseEntity<EntityModel<BillDTO>> updateBill(@PathVariable @Parameter(description = "ID of the bill to be updated") Long id,
                                                           @RequestBody BillDTO bill) {
        BillDTO updatedBill = billService.updateBill(id, bill);

        EntityModel<BillDTO> entityModel = EntityModel.of(updatedBill,
                linkTo(methodOn(BillApi.class).getBillById(updatedBill.getId())).withSelfRel(),
                linkTo(methodOn(BillApi.class).getAllBills(Pageable.unpaged())).withRel("all-bills"));

        return ResponseEntity.ok(entityModel);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a bill by ID", description = "Retrieves a bill's details by its ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class)))
            })
    public ResponseEntity<EntityModel<BillDTO>> getBillById(@PathVariable Long id) {
        BillDTO billDTO = billService.getBillById(id);

        EntityModel<BillDTO> entityModel = EntityModel.of(billDTO,
                linkTo(methodOn(BillApi.class).getBillById(id)).withSelfRel(),
                linkTo(methodOn(BillApi.class).getAllBills(Pageable.unpaged())).withRel("all-bills"));

        return ResponseEntity.ok(entityModel);
    }

    @GetMapping("/")
    @Operation(summary = "List all bills", description = "Retrieves a paginated list of all bills.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bills retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            })
    public ResponseEntity<Page<EntityModel<BillDTO>>> getAllBills(@ParameterObject Pageable pageable) {
        Page<BillDTO> billsPage = billService.getAllBills(pageable);
        Page<EntityModel<BillDTO>> entityModelsPage = billsPage.map(billDTO ->
                EntityModel.of(billDTO,
                        linkTo(methodOn(BillApi.class).getBillById(billDTO.getId())).withSelfRel(),
                        linkTo(methodOn(BillApi.class).getAllBills(pageable)).withRel("bills")
                )
        );

        return ResponseEntity.ok(entityModelsPage);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bill", description = "Deletes a bill by its ID.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Bill deleted")
            })
    public ResponseEntity<Void> deleteBill(@PathVariable @Parameter(description = "ID of the bill to delete") Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}

