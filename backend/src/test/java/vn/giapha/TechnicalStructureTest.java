package vn.giapha;

import static com.tngtech.archunit.base.DescribedPredicate.alwaysTrue;
import static com.tngtech.archunit.core.domain.JavaClass.Predicates.belongToAnyOf;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

import com.tngtech.archunit.core.importer.ImportOption.DoNotIncludeTests;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packagesOf = GiaphaApp.class, importOptions = DoNotIncludeTests.class)
class TechnicalStructureTest {

    // prettier-ignore
    @ArchTest
    static final ArchRule respectsTechnicalArchitectureLayers = layeredArchitecture()
        .consideringAllDependencies()
        .layer("Config").definedBy("..config..")
        .layer("Web").definedBy("..web..")
        .optionalLayer("Service").definedBy("..service..")
        .layer("Security").definedBy("..security..")
        .optionalLayer("Persistence").definedBy("..repository..")
        .layer("Domain").definedBy("..domain..")
        .optionalLayer("Core").definedBy("..core..")
        .optionalLayer("Genealogy").definedBy("..genealogy..")
        .optionalLayer("Cms").definedBy("..cms..")

        .whereLayer("Config").mayNotBeAccessedByAnyLayer()
        .whereLayer("Web").mayOnlyBeAccessedByLayers("Config")
        .whereLayer("Service").mayOnlyBeAccessedByLayers("Web", "Config", "Genealogy", "Cms")
        .whereLayer("Security").mayOnlyBeAccessedByLayers("Config", "Service", "Web", "Genealogy", "Cms")
        .whereLayer("Persistence").mayOnlyBeAccessedByLayers("Service", "Security", "Web", "Config", "Genealogy", "Cms")
        .whereLayer("Domain").mayOnlyBeAccessedByLayers("Persistence", "Service", "Security", "Web", "Config", "Genealogy", "Cms")
        .whereLayer("Core").mayOnlyBeAccessedByLayers("Web", "Service", "Security", "Config", "Genealogy", "Cms", "Core")
        .whereLayer("Genealogy").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Genealogy")
        .whereLayer("Cms").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Cms")

        .ignoreDependency(belongToAnyOf(GiaphaApp.class), alwaysTrue())
        .ignoreDependency(alwaysTrue(), belongToAnyOf(
            vn.giapha.config.Constants.class,
            vn.giapha.config.ApplicationProperties.class
        ));
}
