package vn.giapha.web.rest.support;

import vn.giapha.genealogy.api.PersonPrivacyFilter;
import vn.giapha.genealogy.api.PersonPrivacyModel;
import vn.giapha.genealogy.api.ViewerContext;
import vn.giapha.genealogy.api.ViewerRole;
import vn.giapha.security.AuthoritiesConstants;
import vn.giapha.security.SecurityUtils;
import vn.giapha.service.dto.PersonDTO;

/**
 * Bridge PersonDTO ↔ privacy filter (module genealogy).
 */
public final class PersonDtoPrivacyMapper {

    private PersonDtoPrivacyMapper() {}

    public static ViewerContext currentViewer() {
        if (!SecurityUtils.isAuthenticated()) {
            return ViewerContext.guest();
        }
        if (
            SecurityUtils.hasCurrentUserAnyOfAuthorities(
                AuthoritiesConstants.ADMIN,
                "ROLE_GENEALOGY_ADMIN",
                "genealogy_admin"
            )
        ) {
            return ViewerContext.editor();
        }
        return ViewerContext.member();
    }

    public static PersonDTO apply(PersonDTO dto, PersonPrivacyFilter filter) {
        return apply(dto, filter, currentViewer());
    }

    public static PersonDTO apply(PersonDTO dto, PersonPrivacyFilter filter, ViewerContext viewer) {
        if (dto == null || filter == null) {
            return dto;
        }
        PersonPrivacyModel redacted = filter.apply(toModel(dto), viewer);
        applyModel(dto, redacted);
        return dto;
    }

    static PersonPrivacyModel toModel(PersonDTO dto) {
        return new PersonPrivacyModel(
            dto.getLifeStatus(),
            dto.getPrivacy(),
            dto.getBirthSolar(),
            dto.getBirthLunarJson(),
            dto.getNotes(),
            dto.getLinkedUserId(),
            dto.getGraveInfo(),
            dto.getGraveLat(),
            dto.getGraveLng()
        );
    }

    static void applyModel(PersonDTO dto, PersonPrivacyModel model) {
        if (model == null) {
            return;
        }
        dto.setBirthSolar(model.birthSolar());
        dto.setBirthLunarJson(model.birthLunarJson());
        dto.setNotes(model.notes());
        dto.setLinkedUserId(model.linkedUserId());
        dto.setGraveInfo(model.graveInfo());
        dto.setGraveLat(model.graveLat());
        dto.setGraveLng(model.graveLng());
    }

    /** Dùng cho test / ép role. */
    public static ViewerRole peekRole(ViewerContext ctx) {
        return ctx.role();
    }
}
