package com.brhn.xpnsr.services.dtos;

import com.brhn.xpnsr.models.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Objects;

/**
 * Data Transfer Object (DTO) representing a transaction.
 */
public class TransactionDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 104L;

    private Long id;

    @NotNull(message = "Date is required")
    private Timestamp date;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be greater than or equal to 0")
    private BigDecimal amount;

    @Min(value = 0, message = "Due must be greater than or equal to 0")
    private BigDecimal due;

    @Size(max = 100, message = "Title must be up to 100 characters")
    private String title;

    @NotBlank(message = "Currency is required")
    @Size(min = 1, max = 10, message = "Currency must be between 1 and 10 characters")
    private String currency;

    @Size(max = 100, message = "City must be up to 100 characters")
    private String city;

    @Size(max = 100, message = "Country must be up to 100 characters")
    private String country;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @Size(max = 255, message = "Tags cannot exceed 255 characters")
    private String tags;

    @NotNull(message = "Primary category is required")
    private String primaryCategoryId;

    private String secondaryCategoryId;

    /**
     * Retrieves the ID of the transaction.
     *
     * @return The ID of the transaction.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the transaction.
     *
     * @param id The ID to set.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the date of the transaction.
     *
     * @return The date of the transaction.
     */
    public Timestamp getDate() {
        return date;
    }

    /**
     * Sets the date of the transaction.
     *
     * @param date The date to set.
     */
    public void setDate(Timestamp date) {
        this.date = date;
    }

    /**
     * Retrieves the type of the transaction.
     *
     * @return The type of the transaction.
     */
    public TransactionType getType() {
        return type;
    }

    /**
     * Sets the type of the transaction.
     *
     * @param type The type to set.
     */
    public void setType(TransactionType type) {
        this.type = type;
    }

    /**
     * Retrieves the amount of the transaction.
     *
     * @return The amount of the transaction.
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the amount of the transaction.
     *
     * @param amount The amount to set.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Retrieves the due amount of the transaction.
     *
     * @return The due amount of the transaction.
     */
    public BigDecimal getDue() {
        return due;
    }

    /**
     * Sets the due amount of the transaction.
     *
     * @param due The due amount to set.
     */
    public void setDue(BigDecimal due) {
        this.due = due;
    }

    /**
     * Retrieves the title of the transaction.
     *
     * @return The title of the transaction.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title of the transaction.
     *
     * @param title The title to set.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Retrieves the currency of the transaction.
     *
     * @return The currency of the transaction.
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * Sets the currency of the transaction.
     *
     * @param currency The currency to set.
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    /**
     * Retrieves the city associated with the transaction.
     *
     * @return The city associated with the transaction.
     */
    public String getCity() {
        return city;
    }

    /**
     * Sets the city associated with the transaction.
     *
     * @param city The city to set.
     */
    public void setCity(String city) {
        this.city = city;
    }

    /**
     * Retrieves the country associated with the transaction.
     *
     * @return The country associated with the transaction.
     */
    public String getCountry() {
        return country;
    }

    /**
     * Sets the country associated with the transaction.
     *
     * @param country The country to set.
     */
    public void setCountry(String country) {
        this.country = country;
    }

    /**
     * Retrieves the description of the transaction.
     *
     * @return The description of the transaction.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the transaction.
     *
     * @param description The description to set.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Retrieves the tags associated with the transaction.
     *
     * @return The tags associated with the transaction.
     */
    public String getTags() {
        return tags;
    }

    /**
     * Sets the tags associated with the transaction.
     *
     * @param tags The tags to set.
     */
    public void setTags(String tags) {
        this.tags = tags;
    }

    /**
     * Retrieves the primary category ID associated with the transaction.
     *
     * @return The primary category ID associated with the transaction.
     */
    public String getPrimaryCategoryId() {
        return primaryCategoryId;
    }

    /**
     * Sets the primary category ID associated with the transaction.
     *
     * @param primaryCategoryId The primary category ID to set.
     */
    public void setPrimaryCategoryId(String primaryCategoryId) {
        this.primaryCategoryId = primaryCategoryId;
    }

    /**
     * Retrieves the secondary category ID associated with the transaction.
     *
     * @return The secondary category ID associated with the transaction.
     */
    public String getSecondaryCategoryId() {
        return secondaryCategoryId;
    }

    /**
     * Sets the secondary category ID associated with the transaction.
     *
     * @param secondaryCategoryId The secondary category ID to set.
     */
    public void setSecondaryCategoryId(String secondaryCategoryId) {
        this.secondaryCategoryId = secondaryCategoryId;
    }

    /**
     * Checks if this transaction DTO is equal to another object based on their IDs.
     *
     * @param o The object to compare.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TransactionDTO that = (TransactionDTO) o;
        return Objects.equals(id, that.id);
    }

    /**
     * Computes the hash code of this transaction DTO based on its ID.
     *
     * @return The computed hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Generates a string representation of the transaction DTO.
     *
     * @return The string representation of the transaction DTO.
     */
    @Override
    public String toString() {
        return "TransactionDTO{" +
                "id=" + id +
                ", date=" + date +
                ", type=" + type +
                ", amount=" + amount +
                ", due=" + due +
                ", title='" + title + '\'' +
                ", currency='" + currency + '\'' +
                ", city='" + city + '\'' +
                ", country='" + country + '\'' +
                ", description='" + description + '\'' +
                ", tags='" + tags + '\'' +
                ", primaryCategoryId='" + primaryCategoryId + '\'' +
                ", secondaryCategoryId='" + secondaryCategoryId + '\'' +
                '}';
    }
}
