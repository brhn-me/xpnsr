package com.brhn.xpnsr.data;

import com.brhn.xpnsr.models.*;
import com.brhn.xpnsr.repositories.ApplicationRepository;
import com.brhn.xpnsr.repositories.CategoryRepository;
import com.brhn.xpnsr.repositories.TransactionRepository;
import com.brhn.xpnsr.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.UUID;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    // Repositories for interacting with database
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Autowired
    public DataLoader(ApplicationRepository applicationRepository, UserRepository userRepository,
                      CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    // This method is executed upon application startup
    @Override
    public void run(String... args) throws Exception {
        // Check if sample data needs to be loaded
        if (applicationRepository.count() == 0) {
            log.info("Generating sample application data...");
            loadSampleApplications();
        }

        if (userRepository.count() == 0) {
            log.info("Generating sample user data...");
            loadSampleUsers();
        }

        if (categoryRepository.count() == 0) {
            log.info("Generating sample category data...");
            loadSampleCategories();
        }

        if (transactionRepository.count() == 0) {
            log.info("Generating sample transactions data...");
            loadSampleTransactions();
        }
    }

    // Load sample applications into the database
    private void loadSampleApplications() {
        Application app0 = new Application();
        app0.setName("Test");
        app0.setApiKey("c779c66a194f4ddfbc22a9e2dacb5835");

        Application app1 = new Application();
        app1.setName("Android");
        app1.setApiKey(generateApiKey());

        Application app2 = new Application();
        app2.setName("Web");
        app2.setApiKey(generateApiKey());

        applicationRepository.save(app0);
        applicationRepository.save(app1);
        applicationRepository.save(app2);

        // Add more applications as needed
    }

    // Load sample user into the database
    private void loadSampleUsers() {
        User user = new User();
        user.setLogin("sample_user");
        user.setPasswordHash("sample_user_hash");
        user.setFirstName("Sample");
        user.setLastName("User");
        user.setEmail("sample.user@example.com");
        user.setActivated(true);
        user.setCreatedBy("system");
        user.setCreatedDate(new Timestamp(System.currentTimeMillis()));
        user.setLastModifiedBy("system");
        user.setLastModifiedDate(new Timestamp(System.currentTimeMillis()));

        userRepository.save(user);
    }

    // Load sample categories into the database
    private void loadSampleCategories() {
        // Create categories
        Category groceries = createCategory("groceries", "Groceries", TransactionType.EXPENSE, "groceries_icon", "Expenses for groceries and food items");
        Category salary = createCategory("salary", "Salary", TransactionType.EARNING, "salary_icon", "Monthly salary");
        Category utilities = createCategory("utilities", "Utilities", TransactionType.EXPENSE, "utilities_icon", "Monthly bills for utilities like electricity, water, internet");
        Category diningOut = createCategory("dining_out", "Dining Out", TransactionType.EXPENSE, "dining_out_icon",
                "Expenses for eating out at restaurants and cafes");
        Category entertainment = createCategory("entertainment", "Entertainment", TransactionType.EXPENSE, "entertainment_icon", "Expenses on movies, events, and other entertainment");
        Category travel = createCategory("travel", "Travel", TransactionType.EXPENSE, "travel_icon", "Expenses related to personal and family travels");
        Category health = createCategory("health", "Health", TransactionType.EXPENSE, "health_icon", "Medical expenses and health insurance");
        Category education = createCategory("education", "Education", TransactionType.EXPENSE, "education_icon", "Expenses for education, courses, and books");
        Category savings = createCategory("savings", "Savings", TransactionType.EARNING, "savings_icon", "Income saved or " +
                "invested for future use");
        Category gifts = createCategory("gifts", "Gifts", TransactionType.EXPENSE, "gifts_icon", "Money spent on gifts for others");

        // Save categories
        categoryRepository.save(groceries);
        categoryRepository.save(salary);
        categoryRepository.save(utilities);
        categoryRepository.save(diningOut);
        categoryRepository.save(entertainment);
        categoryRepository.save(travel);
        categoryRepository.save(health);
        categoryRepository.save(education);
        categoryRepository.save(savings);
        categoryRepository.save(gifts);
    }

    // Load sample transactions into the database
    private void loadSampleTransactions() {
        User user = userRepository.findAll().iterator().next(); // Fetch first user

        // Fetch sample categories by ID
        Category groceriesCategory = categoryRepository.findById("groceries").orElseThrow();
        Category salaryCategory = categoryRepository.findById("salary").orElseThrow();
        Category utilitiesCategory = categoryRepository.findById("utilities").orElseThrow();
        Category diningOutCategory = categoryRepository.findById("dining_out").orElseThrow();
        Category entertainmentCategory = categoryRepository.findById("entertainment").orElseThrow();
        Category travelCategory = categoryRepository.findById("travel").orElseThrow();
        Category healthCategory = categoryRepository.findById("health").orElseThrow();
        Category educationCategory = categoryRepository.findById("education").orElseThrow();
        Category savingsCategory = categoryRepository.findById("savings").orElseThrow();
        Category giftsCategory = categoryRepository.findById("gifts").orElseThrow();

        // Timestamp for transactions
        Timestamp currentTime = new Timestamp(System.currentTimeMillis());

        // Create and save sample transactions
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("100.00"), groceriesCategory, "Weekly groceries", user);
        createAndSaveTransaction(currentTime, TransactionType.EARNING, new BigDecimal("2000.00"), salaryCategory,
                "Monthly salary", user);
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("150.00"), utilitiesCategory, "Monthly utilities", user);
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("75.00"), diningOutCategory, "Dining out with friends", user);
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("50.00"), entertainmentCategory, "Cinema tickets", user);
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("500.00"), travelCategory, "Weekend getaway", user);
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("200.00"), healthCategory, "Dental appointment", user);
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("300.00"), educationCategory, "Online courses", user);
        createAndSaveTransaction(currentTime, TransactionType.EARNING, new BigDecimal("150.00"), savingsCategory, "Monthly savings contribution", user);
        createAndSaveTransaction(currentTime, TransactionType.EXPENSE, new BigDecimal("100.00"), giftsCategory, "Birthday gift for a friend", user);
    }

    // Helper method to create a category
    private Category createCategory(String id, String name, TransactionType type, String icon, String description) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setType(type);
        category.setIcon(icon);
        category.setDescription(description);
        return category;
    }

    // Helper method to create and save a transaction
    private void createAndSaveTransaction(Timestamp date, TransactionType type, BigDecimal amount, Category primaryCategory, String description, User user) {
        Transaction transaction = new Transaction();
        transaction.setDate(date);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setPrimaryCategory(primaryCategory);
        transaction.setDescription(description);
        transaction.setUser(user);
        transaction.setCurrency("EUR");
        transactionRepository.save(transaction);
    }

    // Helper method to generate a random API key
    private String generateApiKey() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    // This method is executed after the application has started
    @EventListener(ApplicationReadyEvent.class)
    public void runAfterStartup() {
        try {
            this.run();
        } catch (Exception e) {
            log.error("Error running DataLoader", e);
        }
    }
}