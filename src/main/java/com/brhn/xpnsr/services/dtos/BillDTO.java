package com.brhn.xpnsr.services.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.hateoas.RepresentationModel;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

public class BillDTO extends RepresentationModel<BillDTO> implements Serializable {
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

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BillDTO billDTO = (BillDTO) o;
        return Objects.equals(id, billDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

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