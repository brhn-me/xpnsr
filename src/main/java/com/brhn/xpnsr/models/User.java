package com.brhn.xpnsr.models;

import jakarta.persistence.*;
import org.springframework.data.annotation.Id;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;
import java.util.Objects;

/**
 * Entity class representing a user in the application.
 */
@Entity
@Table(name = "users")
public class User {
    @Id
    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true, nullable = false, length = 50)
    private String login;

    @NotNull
    @Column(name = "password_hash", nullable = false, length = 60)
    private String passwordHash;

    @NotNull
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(length = 255, unique = true)
    private String email;

    @Column(nullable = false)
    private Boolean activated;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "created_date", nullable = false)
    private Timestamp createdDate;

    @Column(name = "last_modified_by", length = 50)
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    private Timestamp lastModifiedDate;

    /**
     * Retrieves the ID of the user.
     *
     * @return The ID of the user.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the user.
     *
     * @param id The ID of the user.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the login username of the user.
     *
     * @return The login username.
     */
    public String getLogin() {
        return login;
    }

    /**
     * Sets the login username of the user.
     *
     * @param login The login username.
     */
    public void setLogin(String login) {
        this.login = login;
    }

    /**
     * Retrieves the password hash of the user.
     *
     * @return The password hash (not recommended to expose in plaintext).
     */
    public String getPasswordHash() {
        return passwordHash;
    }

    /**
     * Sets the password hash of the user.
     *
     * @param passwordHash The password hash (not recommended to expose in plaintext).
     */
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    /**
     * Retrieves the first name of the user.
     *
     * @return The first name.
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * Sets the first name of the user.
     *
     * @param firstName The first name.
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Retrieves the last name of the user.
     *
     * @return The last name.
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * Sets the last name of the user.
     *
     * @param lastName The last name.
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Retrieves the email address of the user.
     *
     * @return The email address.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the email address of the user.
     *
     * @param email The email address.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Retrieves the activation status of the user account.
     *
     * @return `true` if activated, `false` otherwise.
     */
    public Boolean getActivated() {
        return activated;
    }

    /**
     * Sets the activation status of the user account.
     *
     * @param activated `true` if activated, `false` otherwise.
     */
    public void setActivated(Boolean activated) {
        this.activated = activated;
    }

    /**
     * Retrieves the creator of the user account.
     *
     * @return The creator.
     */
    public String getCreatedBy() {
        return createdBy;
    }

    /**
     * Sets the creator of the user account.
     *
     * @param createdBy The creator.
     */
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Retrieves the creation date of the user account.
     *
     * @return The creation date.
     */
    public Timestamp getCreatedDate() {
        return createdDate;
    }

    /**
     * Sets the creation date of the user account.
     *
     * @param createdDate The creation date.
     */
    public void setCreatedDate(Timestamp createdDate) {
        this.createdDate = createdDate;
    }

    /**
     * Retrieves the last modifier of the user account.
     *
     * @return The last modifier.
     */
    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    /**
     * Sets the last modifier of the user account.
     *
     * @param lastModifiedBy The last modifier.
     */
    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    /**
     * Retrieves the last modification date of the user account.
     *
     * @return The last modification date.
     */
    public Timestamp getLastModifiedDate() {
        return lastModifiedDate;
    }

    /**
     * Sets the last modification date of the user account.
     *
     * @param lastModifiedDate The last modification date.
     */
    public void setLastModifiedDate(Timestamp lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    /**
     * Indicates whether some other object is "equal to" this one based on email uniqueness.
     *
     * @param o The reference object with which to compare.
     * @return `true` if this object is the same as the o argument; `false` otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(email, user.email);
    }

    /**
     * Generates a hash code value for the user based on its email.
     *
     * @return The hash code value for the user.
     */
    @Override
    public int hashCode() {
        return Objects.hash(email);
    }

    /**
     * Returns a string representation of the user, including its ID, login, first name,
     * last name, email, activation status, creator, creation date, last modifier, and last
     * modification date.
     *
     * @return A string representation of the user.
     */
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", login='" + login + '\'' +
                ", passwordHash='********'" +  // IMPORTANT: password hash should not be even in toString()
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", activated=" + activated +
                ", createdBy='" + createdBy + '\'' +
                ", createdDate=" + createdDate +
                ", lastModifiedBy='" + lastModifiedBy + '\'' +
                ", lastModifiedDate=" + lastModifiedDate +
                '}';
    }
}
