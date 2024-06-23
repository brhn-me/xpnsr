package com.brhn.xpnsr.services.dtos;

import com.brhn.xpnsr.models.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

/**
 * Data Transfer Object (DTO) representing a Category entity for service layer operations.
 */
public class CategoryDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 103L;

    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @Size(max = 50, message = "Icon reference must be up to 50 characters")
    private String icon;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    private String parentId;

    /**
     * Retrieves the ID of the category DTO.
     *
     * @return The ID of the category DTO.
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the ID of the category DTO.
     *
     * @param id The ID to set.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Retrieves the name of the category DTO.
     *
     * @return The name of the category DTO.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the category DTO.
     *
     * @param name The name to set.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Retrieves the transaction type of the category DTO.
     *
     * @return The transaction type of the category DTO.
     */
    public TransactionType getType() {
        return type;
    }

    /**
     * Sets the transaction type of the category DTO.
     *
     * @param type The transaction type to set.
     */
    public void setType(TransactionType type) {
        this.type = type;
    }

    /**
     * Retrieves the icon reference of the category DTO.
     *
     * @return The icon reference of the category DTO.
     */
    public String getIcon() {
        return icon;
    }

    /**
     * Sets the icon reference of the category DTO.
     *
     * @param icon The icon reference to set.
     */
    public void setIcon(String icon) {
        this.icon = icon;
    }

    /**
     * Retrieves the description of the category DTO.
     *
     * @return The description of the category DTO.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the category DTO.
     *
     * @param description The description to set.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Retrieves the parent ID associated with the category DTO.
     *
     * @return The parent ID associated with the category DTO.
     */
    public String getParentId() {
        return parentId;
    }

    /**
     * Sets the parent ID associated with the category DTO.
     *
     * @param parentId The parent ID to set.
     */
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    /**
     * Checks if this category DTO is equal to another object based on their IDs.
     *
     * @param o The object to compare.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CategoryDTO that = (CategoryDTO) o;
        return Objects.equals(id, that.id);
    }

    /**
     * Computes the hash code of this category DTO based on its ID.
     *
     * @return The computed hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Generates a string representation of the category DTO.
     *
     * @return The string representation of the category DTO.
     */
    @Override
    public String toString() {
        return "CategoryDTO{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", icon='" + icon + '\'' +
                ", description='" + description + '\'' +
                ", parentId='" + parentId + '\'' +
                '}';
    }
}