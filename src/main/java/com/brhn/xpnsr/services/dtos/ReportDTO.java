package com.brhn.xpnsr.services.dtos;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * Data Transfer Object (DTO) representing a report containing category and amount.
 */
public class ReportDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 111L;

    private String category;
    private BigDecimal amount;

    /**
     * Retrieves the category associated with the report.
     *
     * @return The category of the report.
     */
    public String getCategory() {
        return category;
    }

    /**
     * Sets the category for the report.
     *
     * @param category The category to set.
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * Retrieves the amount associated with the report.
     *
     * @return The amount of the report.
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the amount for the report.
     *
     * @param amount The amount to set.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Generates a string representation of the report DTO.
     *
     * @return The string representation of the report DTO.
     */
    @Override
    public String toString() {
        return "ReportDTO{" +
                "category='" + category + '\'' +
                ", amount=" + amount +
                '}';
    }

    /**
     * Checks if this report DTO is equal to another object based on their categories.
     *
     * @param o The object to compare.
     * @return True if the objects are equal (same class and category), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReportDTO reportDTO = (ReportDTO) o;
        return Objects.equals(category, reportDTO.category);
    }

    /**
     * Computes the hash code of this report DTO based on its category.
     *
     * @return The computed hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(category);
    }
}
