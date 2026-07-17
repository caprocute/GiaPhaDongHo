package vn.giapha.donation.internal;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class VietQrBuilderUnitTest {

    private final VietQrBuilder builder = new VietQrBuilder(new ObjectMapper());

    @Test
    void buildsImgVietQrUrl() {
        String payload = "{\"bankBin\":\"970418\",\"accountNo\":\"123456789\",\"accountName\":\"HOI DONG HO\"}";
        String url = builder.buildImageUrl(payload, new BigDecimal("500000"), "CONG DUC 1");
        assertThat(url).startsWith("https://img.vietqr.io/image/970418-123456789-compact2.png?");
        assertThat(url).contains("amount=500000");
        assertThat(url).contains("addInfo=");
        assertThat(url).contains("accountName=");
    }

    @Test
    void returnsNullWhenPayloadInvalid() {
        assertThat(builder.buildImageUrl("not-json", BigDecimal.TEN, "x")).isNull();
        assertThat(builder.buildImageUrl("{}", BigDecimal.TEN, "x")).isNull();
    }
}
