package com.brhn.xpnsr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

/**
 * Represents a category entity with attributes like id, name, type, icon, description, and parentId.
 */
@Entity
@Table(name = "categories")
public class Category implements Serializable {

    @Serial
    private static final long serialVersionUID = 3L;

    @jakarta.persistence.Id
    @Id
    private String id; // Unique identifier for the category

    @NotNull(message = "Name cannot be null")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name; // Name of the category

    @NotNull(message = "Transaction type cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private TransactionType type; // Type of transactions associated with the category

    @Size(max = 50, message = "Icon reference must be up to 50 characters")
    @Column(length = 50)
    private String icon; // Reference to an icon associated with the category

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Column(length = 255)
    private String description; // Description of the category

    @Column(name = "parent_id")
    private String parentId; // Parent category ID, if applicable

    /**
     * Sets the unique identifier of the category.
     *
     * @param id The unique identifier (ID) to set for the category.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Retrieves the unique identifier of the category.
     *
     * @return The unique identifier (ID) of the category.
     */
    public String getId() {
        return id;
    }

    /**
     * Retrieves the name of the category.
     *
     * @return The name of the category.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the category.
     *
     * @param name The name to set for the category.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Retrieves the transaction type associated with the category.
     *
     * @return The transaction type associated with the category.
     */
    public TransactionType getType() {
        return type;
    }

    /**
     * Sets the transaction type associated with the category.
     *
     * @param type The transaction type to set for the category.
     */
    public void setType(TransactionType type) {
        this.type = type;
    }

    /**
     * Retrieves the icon reference associated with the category.
     *
     * @return The icon reference associated with the category.
     */
    public String getIcon() {
        return icon;
    }

    /**
     * Sets the icon reference associated with the category.
     *
     * @param icon The icon reference to set for the category.
     */
    public void setIcon(String icon) {
        this.icon = icon;
    }

    /**
     * Retrieves the description of the category.
     *
     * @return The description of the category.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the category.
     *
     * @param description The description to set for the category.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Retrieves the parent category ID, if applicable.
     *
     * @return The parent category ID, or null if none is set.
     */
    public String getParentId() {
        return parentId;
    }

    /**
     * Sets the parent category ID for the category.
     *
     * @param parentId The parent category ID to set for the category.
     */
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    /**
     * Compares this category with another object for equality based on ID.
     *
     * @param o The object to compare with this category.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(id, category.id);
    }

    /**
     * Generates a hash code value for the category based on its ID.
     *
     * @return The hash code value for the category.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Returns a string representation of the category, including its ID, name, type, icon,
     * description, and parentId.
     *
     * @return A string representation of the category.
     */
    @Override
    public String toString() {
        return "Category{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", icon='" + icon + '\'' +
                ", description='" + description + '\'' +
                ", parentId='" + parentId + '\'' +
                '}';
    }
}
