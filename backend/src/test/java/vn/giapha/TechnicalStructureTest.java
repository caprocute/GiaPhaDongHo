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
        .optionalLayer("Iam").definedBy("..iam..")
        .optionalLayer("Search").definedBy("..search..")
        .optionalLayer("Moderation").definedBy("..moderation..")
        .optionalLayer("Donation").definedBy("..donation..")
        .optionalLayer("Event").definedBy("..event..")
        .optionalLayer("Notification").definedBy("..notification..")
        .optionalLayer("Scholarship").definedBy("..scholarship..")
        .optionalLayer("Book").definedBy("..book..")
        .optionalLayer("System").definedBy("..system..")
        .optionalLayer("Media").definedBy("..media..")

        .whereLayer("Config").mayNotBeAccessedByAnyLayer()
        .whereLayer("Web").mayOnlyBeAccessedByLayers("Config")
        .whereLayer("Service").mayOnlyBeAccessedByLayers("Web", "Config", "Genealogy", "Cms", "Iam", "Search", "Moderation", "Donation", "Event", "Notification", "Scholarship", "Book", "System", "Media")
        .whereLayer("Security").mayOnlyBeAccessedByLayers("Config", "Service", "Web", "Genealogy", "Cms", "Iam", "Search", "Moderation", "Donation", "Event", "Notification", "Scholarship", "Book", "System", "Media")
        .whereLayer("Persistence").mayOnlyBeAccessedByLayers("Service", "Security", "Web", "Config", "Genealogy", "Cms", "Iam", "Search", "Moderation", "Donation", "Event", "Notification", "Scholarship", "Book", "System", "Media")
        .whereLayer("Domain").mayOnlyBeAccessedByLayers("Persistence", "Service", "Security", "Web", "Config", "Genealogy", "Cms", "Iam", "Search", "Moderation", "Donation", "Event", "Notification", "Scholarship", "Book", "System", "Media")
        .whereLayer("Core").mayOnlyBeAccessedByLayers("Web", "Service", "Security", "Config", "Genealogy", "Cms", "Iam", "Search", "Moderation", "Donation", "Event", "Notification", "Scholarship", "Book", "System", "Media", "Core")
        .whereLayer("Genealogy").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Genealogy", "Search", "Moderation")
        .whereLayer("Cms").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Cms")
        .whereLayer("Iam").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Security", "Iam")
        .whereLayer("Search").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Search")
        .whereLayer("Moderation").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Moderation")
        .whereLayer("Donation").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Donation")
        .whereLayer("Event").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Event")
        .whereLayer("Notification").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Notification")
        .whereLayer("Scholarship").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Scholarship")
        .whereLayer("Book").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Book")
        .whereLayer("System").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "System")
        .whereLayer("Media").mayOnlyBeAccessedByLayers("Web", "Service", "Config", "Media", "Book")

        .ignoreDependency(belongToAnyOf(GiaphaApp.class), alwaysTrue())
        .ignoreDependency(alwaysTrue(), belongToAnyOf(
            vn.giapha.config.Constants.class,
            vn.giapha.config.ApplicationProperties.class
        ));
}
