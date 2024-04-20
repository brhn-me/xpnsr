package com.brhn.xpnsr.models;

import jakarta.persistence.*;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "api_key", nullable = false)
    private String apiKey; // hash(salt + api_key)


    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKeyHash) {
        this.apiKey = apiKeyHash;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Application that = (Application) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Application{" + "id=" + id + ", name='" + name + '\'' + ", apiKeyHash='" + apiKey + '\'' + '}';
    }
}
