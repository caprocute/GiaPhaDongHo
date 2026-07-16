package vn.giapha.genealogy.api;

import java.time.LocalDate;

/**
 * Snapshot trường nhạy cảm của Person — không phụ thuộc JHipster DTO.
 * Adapter web map từ/sang {@code PersonDTO}.
 */
public record PersonPrivacyModel(
    String lifeStatus,
    String privacy,
    LocalDate birthSolar,
    String birthLunarJson,
    String notes,
    String linkedUserId,
    String graveInfo,
    Double graveLat,
    Double graveLng
) {
    public PersonPrivacyModel withRedactedPii() {
        return new PersonPrivacyModel(
            lifeStatus,
            privacy,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );
    }
}
