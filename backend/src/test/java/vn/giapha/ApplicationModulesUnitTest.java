package vn.giapha;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/**
 * Cưỡng chế ranh giới Spring Modulith (TK-01 / TK-08).
 */
class ApplicationModulesUnitTest {

    @Test
    void verifiesModularStructure() {
        ApplicationModules.of(GiaphaApp.class).verify();
    }
}
