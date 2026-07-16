/**
 * Module tìm kiếm — index Person (ES / PG FTS), suggest API (R1.2).
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "search",
    allowedDependencies = { "genealogy :: events", "core :: security" }
)
package vn.giapha.search;
