package vn.giapha.moderation.internal;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import vn.giapha.domain.Person;

class ModerationPatchUnitTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void patchPersonAppliesFields() throws Exception {
        Person p = new Person();
        p.setFullName("Cũ");
        p.setNotes("n1");
        var fields = mapper.readTree(
            """
            {"fullName":"Mới","notes":"ghi chú","lifeStatus":"deceased","birthSolar":"1990-05-01"}
            """
        );
        ModerationService.patchPerson(p, fields);
        assertThat(p.getFullName()).isEqualTo("Mới");
        assertThat(p.getNotes()).isEqualTo("ghi chú");
        assertThat(p.getLifeStatus()).isEqualTo("deceased");
        assertThat(p.getBirthSolar()).isEqualTo(java.time.LocalDate.of(1990, 5, 1));
    }
}
