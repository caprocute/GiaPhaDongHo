/**
 * Module hệ thống: module_registry + audit_log (R2.8).
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "system",
    allowedDependencies = { "core :: security" }
)
package vn.giapha.system;
