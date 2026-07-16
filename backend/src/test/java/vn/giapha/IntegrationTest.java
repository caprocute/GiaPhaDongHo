package vn.giapha;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.context.ImportTestcontainers;
import vn.giapha.config.AsyncSyncConfiguration;
import vn.giapha.config.DatabaseTestcontainer;
import vn.giapha.config.JacksonConfiguration;
import vn.giapha.config.TestSecurityConfiguration;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = {
        GiaphaApp.class,
        JacksonConfiguration.class,
        AsyncSyncConfiguration.class,
        TestSecurityConfiguration.class,
        vn.giapha.config.JacksonHibernateConfiguration.class,
    }
)
@ImportTestcontainers(DatabaseTestcontainer.class)
public @interface IntegrationTest {}
