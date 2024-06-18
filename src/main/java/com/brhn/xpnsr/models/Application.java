package com.brhn.xpnsr.models;

import jakarta.persistence.*;

import java.util.Objects;
import java.util.UUID;

/**
 * Represents an application entity with unique identifier, name, and hashed API key.
 */
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id; // Unique identifier for the application

    @Column(name = "name", nullable = false, length = 100)
    private String name; // Name of the application

    @Column(name = "api_key", nullable = false)
    private String apiKey; // Hashed API key, stored with salt

    /**
     * Retrieves the unique identifier of the application.
     *
     * @return The unique identifier (UUID) of the application.
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the application.
     *
     * @param id The unique identifier (UUID) to set for the application.
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Retrieves the name of the application.
     *
     * @return The name of the application.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the application.
     *
     * @param name The name to set for the application.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Retrieves the hashed API key of the application.
     *
     * @return The hashed API key of the application.
     */
    public String getApiKey() {
        return apiKey;
    }

    /**
     * Sets the hashed API key of the application.
     *
     * @param apiKeyHash The hashed API key to set for the application.
     */
    public void setApiKey(String apiKeyHash) {
        this.apiKey = apiKeyHash;
    }

    /**
     * Compares this application with another object for equality based on their IDs.
     *
     * @param o The object to compare with this application.
     * @return True if the objects are equal (same class and ID), false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Application that = (Application) o;
        return Objects.equals(id, that.id);
    }

    /**
     * Generates a hash code value for the application based on its ID.
     *
     * @return The hash code value for the application.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Returns a string representation of the application, including its ID, name, and hashed API key.
     *
     * @return A string representation of the application.
     */
    @Override
    public String toString() {
        return "Application{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", apiKeyHash='" + apiKey + '\'' +
                '}';
    }
}
