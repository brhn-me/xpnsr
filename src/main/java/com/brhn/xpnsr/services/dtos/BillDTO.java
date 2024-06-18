package com.brhn.xpnsr.services.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.hateoas.RepresentationModel;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * Data Transfer Object (DTO) representing a Bill entity for service layer operations.
 */
public class BillDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 101L;

    private Long id;

    @NotNull(message = "Tenure is required")
    @Min(value = 0, message = "Tenure must be a positive integer")
    private Integer tenure;

    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be greater than or equal to 0")
    private BigDecimal amount;

    @NotBlank(message = "Category is required")
    private String categoryId;

    /**
     * Retrieves the ID of the bill DTO.
     *
     * @return The ID of the bill DTO.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the bill DTO.
     *
     * @param id The ID to set.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the tenure of the bill DTO.
     *
     * @return The tenure of the bill DTO.
     */
    public Integer getTenure() {
        return tenure;
    }

    /**
     * Sets the tenure of the bill DTO.
     *
     * @param tenure The tenure to set.
     */
    public void setTenure(Integer tenure) {
        this.tenure = tenure;
    }

    /**
     * Retrieves the amount of the bill DTO.
     *
     * @return The amount of the bill DTO.
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the amount of the bill DTO.
     *
     * @param amount The amount to set.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Retrieves the category ID associated with the bill DTO.
     *
     * @return The category ID associated with the bill DTO.
     */
    public String getCategoryId() {
        return categoryId;
    }

    /**
     * Sets the category ID associated with the bill DTO.
     *
     * @param categoryId The category ID to set.
     */
    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    /**
     * Checks if this bill DTO is equal to another object based on their IDs.
     *
     * @param o The object to compare.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BillDTO billDTO = (BillDTO) o;
        return Objects.equals(id, billDTO.id);
    }

    /**
     * Computes the hash code of this bill DTO based on its ID.
     *
     * @return The computed hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Generates a string representation of the bill DTO.
     *
     * @return The string representation of the bill DTO.
     */
    @Override
    public String toString() {
        return "BillDTO{" +
                "id=" + id +
                ", tenure=" + tenure +
                ", amount=" + amount +
                ", categoryId='" + categoryId + '\'' +
                '}';
    }
}
