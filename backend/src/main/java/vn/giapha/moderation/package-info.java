/**
 * Module tự khai / duyệt — public {@code api/} + {@code events/} (F3 / R2.1).
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "moderation",
    allowedDependencies = { "core :: security", "genealogy :: api" }
)
package vn.giapha.moderation;
