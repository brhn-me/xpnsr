package com.brhn.xpnsr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Objects;

@Entity
@Table(name = "transactions")
public class Transaction {

    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Date cannot be null")
    @Column(nullable = false)
    private Timestamp date;

    @NotNull(message = "Transaction type cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private TransactionType type;

    @NotNull(message = "Amount cannot be null")
    @Column(nullable = false, precision = 21, scale = 2)
    private BigDecimal amount;

    @Min(value = 0, message = "Due must be greater than or equal to 0")
    @Column(precision = 21, scale = 2)
    private BigDecimal due;

    @Size(max = 100, message = "Title must be up to 100 characters")
    @Column(length = 100)
    private String title;

    @NotNull(message = "Currency cannot be null")
    @Size(min = 1, max = 10, message = "Currency must be between 1 and 10 characters")
    @Column(length = 10, nullable = false)
    private String currency;

    @Size(max = 100, message = "City must be up to 100 characters")
    @Column(length = 100)
    private String city;

    @Size(max = 100, message = "Country must be up to 100 characters")
    @Column(length = 100)
    private String country;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Column(length = 255)
    private String description;

    @Size(max = 255, message = "Tags cannot exceed 255 characters")
    @Column(length = 255)
    private String tags;

    @NotNull(message = "Primary category cannot be null")
    @ManyToOne
    @JoinColumn(name = "primary_category_id", nullable = false)
    private Category primaryCategory;

    @NotNull(message = "Secondary category cannot be null")
    @ManyToOne
    @JoinColumn(name = "secondary_category_id")
    private Category secondaryCategory;

    @NotNull(message = "User cannot be null")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Timestamp getDate() {
        return date;
    }

    public void setDate(Timestamp date) {
        this.date = date;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getDue() {
        return due;
    }

    public void setDue(BigDecimal due) {
        this.due = due;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Category getPrimaryCategory() {
        return primaryCategory;
    }

    public void setPrimaryCategory(Category primaryCategory) {
        this.primaryCategory = primaryCategory;
    }

    public Category getSecondaryCategory() {
        return secondaryCategory;
    }

    public void setSecondaryCategory(Category secondaryCategory) {
        this.secondaryCategory = secondaryCategory;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transaction that = (Transaction) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

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
