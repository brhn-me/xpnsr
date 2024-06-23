package com.brhn.xpnsr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Objects;

/**
 * Represents a transaction entity with attributes like id, date, type, amount, due, title,
 * currency, city, country, description, tags, primary category, secondary category, and user.
 */
@Entity
@Table(name = "transactions")
public class Transaction {

    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique identifier for the transaction

    @NotNull(message = "Date cannot be null")
    @Column(nullable = false)
    private Timestamp date; // Date and time of the transaction

    @NotNull(message = "Transaction type cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private TransactionType type; // Type of the transaction

    @NotNull(message = "Amount cannot be null")
    @Column(nullable = false, precision = 21, scale = 2)
    private BigDecimal amount; // Amount of the transaction

    @Min(value = 0, message = "Due must be greater than or equal to 0")
    @Column(precision = 21, scale = 2)
    private BigDecimal due; // Due amount for the transaction, if applicable

    @Size(max = 100, message = "Title must be up to 100 characters")
    @Column(length = 100)
    private String title; // Title or brief description of the transaction

    @NotNull(message = "Currency cannot be null")
    @Size(min = 1, max = 10, message = "Currency must be between 1 and 10 characters")
    @Column(length = 10, nullable = false)
    private String currency; // Currency used for the transaction

    @Size(max = 100, message = "City must be up to 100 characters")
    @Column(length = 100)
    private String city; // City associated with the transaction

    @Size(max = 100, message = "Country must be up to 100 characters")
    @Column(length = 100)
    private String country; // Country associated with the transaction

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Column(length = 255)
    private String description; // Detailed description of the transaction

    @Size(max = 255, message = "Tags cannot exceed 255 characters")
    @Column(length = 255)
    private String tags; // Tags associated with the transaction

    @NotNull(message = "Primary category cannot be null")
    @ManyToOne
    @JoinColumn(name = "primary_category_id", nullable = false)
    private Category primaryCategory; // Primary category associated with the transaction

    @ManyToOne
    @JoinColumn(name = "secondary_category_id")
    private Category secondaryCategory; // Secondary category associated with the transaction

    @NotNull(message = "User cannot be null")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // User associated with the transaction

    /**
     * Retrieves the unique identifier of the transaction.
     *
     * @return The unique identifier (ID) of the transaction.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the transaction.
     *
     * @param id The unique identifier (ID) to set for the transaction.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the date and time of the transaction.
     *
     * @return The date and time of the transaction.
     */
    public Timestamp getDate() {
        return date;
    }

    /**
     * Sets the date and time of the transaction.
     *
     * @param date The date and time to set for the transaction.
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
     * @param type The transaction type to set for the transaction.
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
     * @param amount The amount to set for the transaction.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Retrieves the due amount for the transaction.
     *
     * @return The due amount for the transaction.
     */
    public BigDecimal getDue() {
        return due;
    }

    /**
     * Sets the due amount for the transaction.
     *
     * @param due The due amount to set for the transaction.
     */
    public void setDue(BigDecimal due) {
        this.due = due;
    }

    /**
     * Retrieves the title or brief description of the transaction.
     *
     * @return The title or brief description of the transaction.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title or brief description of the transaction.
     *
     * @param title The title or brief description to set for the transaction.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Retrieves the currency used for the transaction.
     *
     * @return The currency used for the transaction.
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * Sets the currency used for the transaction.
     *
     * @param currency The currency to set for the transaction.
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
     * @param city The city to set for the transaction.
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
     * @param country The country to set for the transaction.
     */
    public void setCountry(String country) {
        this.country = country;
    }

    /**
     * Retrieves the detailed description of the transaction.
     *
     * @return The detailed description of the transaction.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the detailed description of the transaction.
     *
     * @param description The description to set for the transaction.
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
     * @param tags The tags to set for the transaction.
     */
    public void setTags(String tags) {
        this.tags = tags;
    }

    /**
     * Retrieves the primary category associated with the transaction.
     *
     * @return The primary category associated with the transaction.
     */
    public Category getPrimaryCategory() {
        return primaryCategory;
    }

    /**
     * Sets the primary category associated with the transaction.
     *
     * @param primaryCategory The primary category to set for the transaction.
     */
    public void setPrimaryCategory(Category primaryCategory) {
        this.primaryCategory = primaryCategory;
    }

    /**
     * Retrieves the secondary category associated with the transaction.
     *
     * @return The secondary category associated with the transaction.
     */
    public Category getSecondaryCategory() {
        return secondaryCategory;
    }

    /**
     * Sets the secondary category associated with the transaction.
     *
     * @param secondaryCategory The secondary category to set for the transaction.
     */
    public void setSecondaryCategory(Category secondaryCategory) {
        this.secondaryCategory = secondaryCategory;
    }

    /**
     * Retrieves the user associated with the transaction.
     *
     * @return The user associated with the transaction.
     */
    public User getUser() {
        return user;
    }

    /**
     * Sets the user associated with the transaction.
     *
     * @param user The user to set for the transaction.
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Compares this transaction with another object for equality based on ID.
     *
     * @param o The object to compare with this transaction.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transaction that = (Transaction) o;
        return Objects.equals(id, that.id);
    }

    /**
     * Generates a hash code value for the transaction based on its ID.
     *
     * @return The hash code value for the transaction.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Returns a string representation of the transaction, including its ID, date, type,
     * amount, due, title, currency, city, country, description, tags, primary category,
     * secondary category, and user.
     *
     * @return A string representation of the transaction.
     */
    @Override
    public String toString() {
        return "Transaction{" +
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
                ", primaryCategory=" + primaryCategory +
                ", secondaryCategory=" + secondaryCategory +
                ", user=" + user +
                '}';
    }
}