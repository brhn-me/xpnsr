package com.brhn.xpnsr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "bills")
public class Bill {

    private static final long serialVersionUID = 1L;

    @Id
    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Tenure cannot be null")
    @Min(value = 0, message = "Tenure must be a positive integer")
    @Column(nullable = false)
    private Integer tenure;

    @NotNull(message = "Amount cannot be null")
    @Min(value = 0, message = "Amount must be greater than or equal to 0")
    @Column(nullable = false)
    private BigDecimal amount;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getTenure() {
        return tenure;
    }

    public void setTenure(Integer tenure) {
        this.tenure = tenure;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Bill bill = (Bill) o;
        return Objects.equals(id, bill.id) && Objects.equals(tenure, bill.tenure) && Objects.equals(amount, bill.amount);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tenure, amount);
    }

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

