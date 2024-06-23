package com.brhn.xpnsr.services.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * Data Transfer Object (DTO) representing a Budget entity for service layer operations.
 */
public class BudgetDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 102L;

    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    @Size(max = 255, message = "Description cannot be more than 255 characters")
    private String description;

    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be greater than or equal to 0")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    @Size(min = 1, max = 10, message = "Currency must be between 1 and 10 characters")
    private String currency;

    @NotNull(message = "Category is required")
    private String categoryId;

    @NotNull(message = "User is required")
    private Long userId;

    /**
     * Retrieves the ID of the budget DTO.
     *
     * @return The ID of the budget DTO.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the budget DTO.
     *
     * @param id The ID to set.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the title of the budget DTO.
     *
     * @return The title of the budget DTO.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title of the budget DTO.
     *
     * @param title The title to set.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Retrieves the description of the budget DTO.
     *
     * @return The description of the budget DTO.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the budget DTO.
     *
     * @param description The description to set.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Retrieves the amount of the budget DTO.
     *
     * @return The amount of the budget DTO.
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the amount of the budget DTO.
     *
     * @param amount The amount to set.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Retrieves the currency of the budget DTO.
     *
     * @return The currency of the budget DTO.
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * Sets the currency of the budget DTO.
     *
     * @param currency The currency to set.
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    /**
     * Retrieves the category ID associated with the budget DTO.
     *
     * @return The category ID associated with the budget DTO.
     */
    public String getCategoryId() {
        return categoryId;
    }

    /**
     * Sets the category ID associated with the budget DTO.
     *
     * @param categoryId The category ID to set.
     */
    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    /**
     * Retrieves the user ID associated with the budget DTO.
     *
     * @return The user ID associated with the budget DTO.
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the user ID associated with the budget DTO.
     *
     * @param userId The user ID to set.
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Checks if this budget DTO is equal to another object based on their IDs.
     *
     * @param o The object to compare.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BudgetDTO budgetDTO = (BudgetDTO) o;
        return Objects.equals(id, budgetDTO.id);
    }

    /**
     * Computes the hash code of this budget DTO based on its ID.
     *
     * @return The computed hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Generates a string representation of the budget DTO.
     *
     * @return The string representation of the budget DTO.
     */
    @Override
    public String toString() {
        return "BudgetDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", categoryId=" + categoryId +
                ", userId=" + userId +
                '}';
    }
}