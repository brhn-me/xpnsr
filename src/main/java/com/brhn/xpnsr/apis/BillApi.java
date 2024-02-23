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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Bill API", description = "The api for managing all bills of XPNSR")
@RequestMapping("/api/bills")
public class BillApi {

    private final BillService billService;

    @Autowired
    public BillApi(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/")
    @Operation(summary = "Create a new bill", description = "Adds a new bill to the system.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill created",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class)))
            })
    public ResponseEntity<BillDTO> createBill(@RequestBody BillDTO b) {
        BillDTO billDTO = billService.createBill(b);
        return ResponseEntity.ok(billDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing bill", description = "Updates details of an existing bill by ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill updated",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class)))
            })
    public ResponseEntity<BillDTO> updateBill(@PathVariable @Parameter(description = "ID of the bill to be updated") Long id,
                                              @RequestBody BillDTO bill) {
        BillDTO updatedBill = billService.updateBill(id, bill);
        return ResponseEntity.ok(updatedBill);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a bill by ID", description = "Retrieves a bill's details by its ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bill found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = BillDTO.class)))
            })
    public ResponseEntity<BillDTO> getBillById(@PathVariable @Parameter(description = "ID of the bill to retrieve") Long id) {
        BillDTO bill = billService.getBillById(id);
        return ResponseEntity.ok(bill);
    }

    @GetMapping("/")
    @Operation(summary = "List all bills", description = "Retrieves a paginated list of all bills.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Bills retrieved",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)))
            })
    public ResponseEntity<Page<BillDTO>> getAllBills(@ParameterObject Pageable pageable) {
        Page<BillDTO> bills = billService.getAllBills(pageable);
        return ResponseEntity.ok(bills);
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