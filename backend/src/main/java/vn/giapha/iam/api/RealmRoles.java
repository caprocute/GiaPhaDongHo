package vn.giapha.iam.api;

/** Realm roles Keycloak (R1.5) — giá trị JWT claim {@code roles}. */
public final class RealmRoles {

    public static final String ADMIN = "ROLE_ADMIN";
    public static final String USER = "ROLE_USER";
    public static final String MEMBER = "ROLE_MEMBER";
    public static final String EDITOR = "ROLE_EDITOR";
    public static final String GENEALOGY_ADMIN = "ROLE_GENEALOGY_ADMIN";

    private RealmRoles() {}
}
