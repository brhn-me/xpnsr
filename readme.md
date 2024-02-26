This project is a RESTful API developed with Spring Boot, designed to manage financial records including bills, budgets, transactions, and user accounts. It leverages Spring Data JPA for database interactions, Spring Data REST for exposing repository content over HTTP, and Spring Security for authentication and authorization, although the latter is commented out in this initial setup.

## Dependencies

This project uses Gradle as the build tool and requires Java 17. The main external libraries and plugins include:

- **Spring Boot (version 3.2.2)**: A framework for creating stand-alone, production-grade Spring-based applications with minimal configuration. It simplifies the bootstrapping and development of new Spring applications.

- **Spring Data JPA**: Simplifies data access within the Java Persistence API. It abstracts boilerplate CRUD operations, providing a more streamlined way to interact with the database.

- **Spring Data REST**: Automatically exposes Spring Data JPA repositories as RESTful endpoints, making it easier to build hypermedia-driven web services.

- **Spring Security**: A powerful and highly customizable authentication and access-control framework. It ensures secure communication in your application by authenticating and authorizing users.

- **Spring Boot Starter Web**: Provides all the dependencies needed to build web applications, including RESTful applications using Spring MVC. It uses Tomcat as the default embedded container.

- **Spring Boot Starter Cache**: Offers generic support for caching. It allows the use of multiple caching configurations and simplifies cache abstraction in Spring applications.

- **Springdoc OpenAPI**: Integrates with Spring Boot to produce OpenAPI 3 documentation for Spring Boot applications. It provides a rich UI to explore and test the API.

- **MapStruct**: A code generator that simplifies the implementation of mappings between Java bean types, based on a convention-over-configuration approach.

- **MySQL Connector-J**: The official JDBC driver for MySQL. It enables Java applications to connect to MySQL databases.

- **JUnit**: A framework for writing repeatable tests. It is an instance of the xUnit architecture for unit testing frameworks.

- **Caffeine Cache**: An in-memory caching library providing a high performance, near-optimal caching mechanism. It's intended for use in scaling applications that require a quick and efficient way to manage cached data.

## Setup Instructions

### Framework Setup

1. **Java JDK Installation**: Ensure Java 17 is installed on your system. You can download it from [AdoptOpenJDK](https://adoptopenjdk.net/) or [Oracle's website](https://www.oracle.com/java/technologies/javase-jdk17-downloads.html).

2. **Gradle**: This project uses Gradle for dependency management and build. Gradle comes with a wrapper script (`gradlew` or `gradlew.bat`), so you don't need to have Gradle installed on your system.

### Database Setup

1. **MySQL Database**: This application requires a MySQL database. Install MySQL if it's not already installed and create a new database for the application.

2. **Schema Migration**: The `schema.sql` file located in the root directory contains the initial database schema. Run this script against your database to create the necessary tables:

   ```sql
   mysql -u yourusername -p yourdatabase < schema.sql
   ```

3. **Application Configuration**: Configure the `application.properties` file in the `src/main/resources` directory with your database connection details:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/yourdatabase
   spring.datasource.username=yourusername
   spring.datasource.password=yourpassword
   spring.jpa.hibernate.ddl-auto=update
   ```

### Running the Application

1. **Build the Application**: Navigate to the root directory of the project in a terminal and run the following command to build the application:

   ```shell
   ./gradlew build
   ```

2. **Run the Application**: After building the application, you can run it using the following command:

   ```shell
   ./gradlew bootRun
   ```

   Alternatively, you can run the compiled JAR file directly:

   ```shell
   java -jar build/libs/com.brhn-0.0.1-SNAPSHOT.jar