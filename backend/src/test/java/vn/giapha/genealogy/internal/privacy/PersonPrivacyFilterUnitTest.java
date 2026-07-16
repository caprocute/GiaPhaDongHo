package vn.giapha.genealogy.internal.privacy;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import vn.giapha.genealogy.api.PersonPrivacyModel;
import vn.giapha.genealogy.api.ViewerContext;

class PersonPrivacyFilterUnitTest {

    private final DefaultPersonPrivacyFilter filter = new DefaultPersonPrivacyFilter();

    private PersonPrivacyModel alive() {
        return new PersonPrivacyModel(
            "alive",
            "members",
            LocalDate.of(1990, 5, 1),
            "{\"d\":1}",
            "ghi chú riêng",
            "user-1",
            "mộ A",
            21.0,
            105.0
        );
    }

    @Test
    void guestCannotSeeAlivePii() {
        PersonPrivacyModel out = filter.apply(alive(), ViewerContext.guest());
        assertThat(out.birthSolar()).isNull();
        assertThat(out.birthLunarJson()).isNull();
        assertThat(out.notes()).isNull();
        assertThat(out.linkedUserId()).isNull();
        assertThat(out.graveLat()).isNull();
    }

    @Test
    void memberSeesAlivePii() {
        PersonPrivacyModel out = filter.apply(alive(), ViewerContext.member());
        assertThat(out.birthSolar()).isEqualTo(LocalDate.of(1990, 5, 1));
        assertThat(out.notes()).isEqualTo("ghi chú riêng");
    }

    @Test
    void guestSeesDeceasedPii() {
        PersonPrivacyModel deceased = new PersonPrivacyModel(
            "deceased",
            "members",
            LocalDate.of(1920, 1, 1),
            "{}",
            "tiểu sử",
            null,
            "mộ",
            21.0,
            105.0
        );
        PersonPrivacyModel out = filter.apply(deceased, ViewerContext.guest());
        assertThat(out.birthSolar()).isEqualTo(LocalDate.of(1920, 1, 1));
        assertThat(out.graveInfo()).isEqualTo("mộ");
    }

    @Test
    void privateRedactsEvenForMember() {
        PersonPrivacyModel priv = new PersonPrivacyModel(
            "alive",
            "private",
            LocalDate.of(2000, 1, 1),
            "{}",
            "x",
            "u",
            null,
            null,
            null
        );
        assertThat(filter.apply(priv, ViewerContext.member()).birthSolar()).isNull();
        assertThat(filter.apply(priv, ViewerContext.editor()).birthSolar()).isEqualTo(LocalDate.of(2000, 1, 1));
    }
}
