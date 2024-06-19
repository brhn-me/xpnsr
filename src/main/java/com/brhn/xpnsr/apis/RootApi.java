package com.brhn.xpnsr.apis;

import com.brhn.xpnsr.services.dtos.LinksDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * RootApi is a REST controller that provides the root endpoints of the API.
 * It generates and returns a RootDTO object containing links to various API resources.
 */
@RestController
@RequestMapping("/api")
public class RootApi {

    /**
     * Returns a RootDTO containing links to various API resources.
     *
     * @return ResponseEntity containing a RootDTO with links to the available resources.
     */
    @GetMapping
    public ResponseEntity<LinksDTO> getRootLinks() {
        LinksDTO rootDTO = new LinksDTO();
        rootDTO.add(WebMvcLinkBuilder.linkTo(methodOn(BillApi.class).getAllBills(Pageable.unpaged())).withRel("bills"));
        rootDTO.add(WebMvcLinkBuilder.linkTo(methodOn(BudgetApi.class).getAllBudgets(Pageable.unpaged())).withRel("budgets"));
        rootDTO.add(WebMvcLinkBuilder.linkTo(methodOn(CategoryApi.class).getAllCategories(Pageable.unpaged())).withRel("categories"));
        rootDTO.add(WebMvcLinkBuilder.linkTo(methodOn(TransactionApi.class).getAll(Pageable.unpaged())).withRel("transactions"));
        rootDTO.add(WebMvcLinkBuilder.linkTo(methodOn(UserApi.class).getAllUsers(Pageable.unpaged())).withRel("users"));
        rootDTO.add(WebMvcLinkBuilder.linkTo(methodOn(ReportsApi.class).getReportsRoot()).withRel("reports"));

        return ResponseEntity.ok(rootDTO);
    }
}
