/**
 * Module IAM — bridge Keycloak, profile, RBAC (TK-01 / R1.5).
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "iam",
    allowedDependencies = { "core :: security" }
)
package vn.giapha.iam;
