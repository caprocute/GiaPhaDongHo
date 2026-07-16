package vn.giapha.core.lunar;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import org.junit.jupiter.api.Test;

/**
 * Golden vectors đồng bộ {@code frontend/shared/lunar-vectors/golden.json}.
 */
class LunarCalendarUnitTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void goldenVectorsSolarToLunarAndRoundTrip() throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/lunar-vectors/golden.json")) {
            assertThat(in).as("golden.json trên classpath test").isNotNull();
            JsonNode vectors = mapper.readTree(in);
            for (JsonNode vector : vectors) {
                String label = vector.path("label").asText();
                JsonNode solar = vector.get("solar");
                JsonNode lunar = vector.get("lunar");
                int sd = solar.get("day").asInt();
                int sm = solar.get("month").asInt();
                int sy = solar.get("year").asInt();
                LunarDate got = LunarCalendar.convertSolarToLunar(sd, sm, sy);
                assertThat(got.day()).as("%s day", label).isEqualTo(lunar.get("day").asInt());
                assertThat(got.month()).as("%s month", label).isEqualTo(lunar.get("month").asInt());
                assertThat(got.year()).as("%s year", label).isEqualTo(lunar.get("year").asInt());
                assertThat(got.leap()).as("%s leap", label).isEqualTo(lunar.get("leap").asBoolean());

                SolarDate back = LunarCalendar.convertLunarToSolar(
                    lunar.get("day").asInt(),
                    lunar.get("month").asInt(),
                    lunar.get("year").asInt(),
                    lunar.get("leap").asBoolean()
                );
                assertThat(back.day()).as("%s round-trip day", label).isEqualTo(sd);
                assertThat(back.month()).as("%s round-trip month", label).isEqualTo(sm);
                assertThat(back.year()).as("%s round-trip year", label).isEqualTo(sy);

                if (vector.has("canChiYear")) {
                    assertThat(LunarCalendar.getCanChiYear(got.year()).label())
                        .as("%s canChiYear", label)
                        .isEqualTo(vector.get("canChiYear").asText());
                }
            }
        }
    }

    @Test
    void canChiYearTetGiapThin() {
        assertThat(LunarCalendar.getCanChiYear(2024).label()).isEqualTo("Giáp Thìn");
        assertThat(LunarCalendar.getCanChi(10, 2, 2024, "year").label()).isEqualTo("Giáp Thìn");
    }
}
