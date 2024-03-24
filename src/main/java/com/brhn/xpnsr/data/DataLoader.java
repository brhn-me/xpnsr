package com.brhn.xpnsr.data;

import com.brhn.xpnsr.models.Application;
import com.brhn.xpnsr.models.User;
import com.brhn.xpnsr.repositories.ApplicationRepository;
import com.brhn.xpnsr.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.sql.Timestamp;
import java.util.UUID;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Autowired
    public DataLoader(ApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (applicationRepository.count() == 0) {
            log.info("Generating sample data...");
            loadSampleApplications();
            log.info("Sample data generation completed.");
        }
    }

    private void loadSampleApplications() {
        // generate dummy applications with api keys
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


        // load user
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

        // Add more applications as needed
    }

    private String generateApiKey() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void runAfterStartup() {
        try {
            this.run();
        } catch (Exception e) {
            log.error("Error running DataLoader", e);
        }
    }
}

