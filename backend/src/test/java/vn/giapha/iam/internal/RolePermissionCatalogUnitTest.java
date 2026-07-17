package vn.giapha.iam.internal;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.giapha.iam.api.RealmRoles;

class RolePermissionCatalogUnitTest {

    private RolePermissionCatalog catalog;

    @BeforeEach
    void setUp() {
        catalog = new RolePermissionCatalog();
    }

    @Test
    void adminHasWildcard() {
        assertThat(catalog.hasPermission(List.of(RealmRoles.ADMIN), "cms:post:write")).isTrue();
        assertThat(catalog.hasPermission(List.of(RealmRoles.ADMIN), "genealogy:person:write")).isTrue();
        assertThat(catalog.resolvePermissions(List.of(RealmRoles.ADMIN))).contains("*");
    }

    @Test
    void editorCanWriteCmsButNotGenealogyWrite() {
        List<String> roles = List.of(RealmRoles.EDITOR);
        assertThat(catalog.hasPermission(roles, "cms:post:write")).isTrue();
        assertThat(catalog.hasPermission(roles, "genealogy:person:read")).isTrue();
        assertThat(catalog.hasPermission(roles, "genealogy:person:write")).isFalse();
    }

    @Test
    void memberReadOnly() {
        List<String> roles = List.of(RealmRoles.MEMBER);
        assertThat(catalog.hasPermission(roles, "cms:post:read")).isTrue();
        assertThat(catalog.hasPermission(roles, "cms:post:write")).isFalse();
        assertThat(catalog.hasPermission(roles, "genealogy:union:write")).isFalse();
    }

    @Test
    void genealogyAdminCanWriteTree() {
        Set<String> perms = catalog.resolvePermissions(List.of(RealmRoles.GENEALOGY_ADMIN));
        assertThat(perms).contains("genealogy:person:write", "genealogy:union:write", "genealogy:tree:write");
        assertThat(catalog.hasPermission(List.of(RealmRoles.GENEALOGY_ADMIN), "cms:post:write")).isFalse();
    }

    @Test
    void acceptsRoleWithoutPrefix() {
        assertThat(catalog.hasPermission(List.of("editor"), "cms:post:write")).isTrue();
    }
}
