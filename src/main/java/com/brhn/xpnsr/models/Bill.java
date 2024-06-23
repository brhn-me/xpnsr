package com.brhn.xpnsr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Represents a bill entity with attributes like tenure, amount, associated user, and category.
 */
@Entity
@Table(name = "bills")
public class Bill {

    private static final long serialVersionUID = 1L;

    @Id
    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique identifier for the bill

    @NotNull(message = "Tenure cannot be null")
    @Min(value = 0, message = "Tenure must be a positive integer")
    @Column(nullable = false)
    private Integer tenure; // Tenure period of the bill (in months)

    @NotNull(message = "Amount cannot be null")
    @Min(value = 0, message = "Amount must be greater than or equal to 0")
    @Column(nullable = false)
    private BigDecimal amount; // Amount of the bill

    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // User associated with the bill

    @NotNull
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category; // Category associated with the bill

    /**
     * Retrieves the unique identifier of the bill.
     *
     * @return The unique identifier (ID) of the bill.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the bill.
     *
     * @param id The unique identifier (ID) to set for the bill.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the tenure period of the bill.
     *
     * @return The tenure period (in months) of the bill.
     */
    public Integer getTenure() {
        return tenure;
    }

    /**
     * Sets the tenure period of the bill.
     *
     * @param tenure The tenure period (in months) to set for the bill.
     */
    public void setTenure(Integer tenure) {
        this.tenure = tenure;
    }

    /**
     * Retrieves the amount of the bill.
     *
     * @return The amount of the bill.
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the amount of the bill.
     *
     * @param amount The amount to set for the bill.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Retrieves the user associated with the bill.
     *
     * @return The user associated with the bill.
     */
    public User getUser() {
        return user;
    }

    /**
     * Sets the user associated with the bill.
     *
     * @param user The user to set for the bill.
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Retrieves the category associated with the bill.
     *
     * @return The category associated with the bill.
     */
    public Category getCategory() {
        return category;
    }

    /**
     * Sets the category associated with the bill.
     *
     * @param category The category to set for the bill.
     */
    public void setCategory(Category category) {
        this.category = category;
    }

    /**
     * Compares this bill with another object for equality based on ID, tenure, and amount.
     *
     * @param o The object to compare with this bill.
     * @return True if the objects are equal (same class, ID, tenure, and amount), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Bill bill = (Bill) o;
        return Objects.equals(id, bill.id) &&
                Objects.equals(tenure, bill.tenure) &&
                Objects.equals(amount, bill.amount);
    }

    /**
     * Generates a hash code value for the bill based on its ID, tenure, and amount.
     *
     * @return The hash code value for the bill.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id, tenure, amount);
    }

    /**
     * Returns a string representation of the bill, including its ID, tenure, amount, user, and category.
     *
     * @return A string representation of the bill.
     */
    @Override
    public String toString() {
        return "Bill{" +
                "id=" + id +
                ", tenure=" + tenure +
                ", amount=" + amount +
                ", user=" + user +
                ", category=" + category +
                '}';
    }
}