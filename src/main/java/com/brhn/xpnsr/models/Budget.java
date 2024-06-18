package com.brhn.xpnsr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Represents a budget entity with attributes like title, description, amount, currency,
 * associated category, and user.
 */
@Entity
@Table(name = "budgets")
public class Budget {

    private static final long serialVersionUID = 2L;

    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique identifier for the budget

    @NotNull(message = "Title cannot be null")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    @Column(length = 100, nullable = false)
    private String title; // Title of the budget

    @Size(max = 255, message = "Description cannot be more than 255 characters")
    @Column(length = 255)
    private String description; // Description of the budget

    @NotNull(message = "Amount cannot be null")
    @Min(value = 0, message = "Amount must be greater than or equal to 0")
    @Column(nullable = false, precision = 21, scale = 2)
    private BigDecimal amount; // Amount allocated for the budget

    @Size(max = 10, message = "Currency cannot be greater than 10 characters")
    @Column(length = 10)
    private String currency; // Currency used for the budget

    @NotNull(message = "Category cannot be null")
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category; // Category associated with the budget

    @NotNull(message = "User cannot be null")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // User associated with the budget

    /**
     * Retrieves the unique identifier of the budget.
     *
     * @return The unique identifier (ID) of the budget.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the budget.
     *
     * @param id The unique identifier (ID) to set for the budget.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the title of the budget.
     *
     * @return The title of the budget.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title of the budget.
     *
     * @param title The title to set for the budget.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Retrieves the description of the budget.
     *
     * @return The description of the budget.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the budget.
     *
     * @param description The description to set for the budget.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Retrieves the amount allocated for the budget.
     *
     * @return The amount allocated for the budget.
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the amount allocated for the budget.
     *
     * @param amount The amount to set for the budget.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Retrieves the currency used for the budget.
     *
     * @return The currency used for the budget.
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * Sets the currency used for the budget.
     *
     * @param currency The currency to set for the budget.
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    /**
     * Retrieves the category associated with the budget.
     *
     * @return The category associated with the budget.
     */
    public Category getCategory() {
        return category;
    }

    /**
     * Sets the category associated with the budget.
     *
     * @param category The category to set for the budget.
     */
    public void setCategory(Category category) {
        this.category = category;
    }

    /**
     * Retrieves the user associated with the budget.
     *
     * @return The user associated with the budget.
     */
    public User getUser() {
        return user;
    }

    /**
     * Sets the user associated with the budget.
     *
     * @param user The user to set for the budget.
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Compares this budget with another object for equality based on ID.
     *
     * @param o The object to compare with this budget.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Budget budget = (Budget) o;
        return Objects.equals(id, budget.id);
    }

    /**
     * Generates a hash code value for the budget based on its ID.
     *
     * @return The hash code value for the budget.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Returns a string representation of the budget, including its ID, title, description,
     * amount, currency, category, and user.
     *
     * @return A string representation of the budget.
     */
    @Override
    public String toString() {
        return "Budget{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", category=" + category +
                ", user=" + user +
                '}';
    }
}
