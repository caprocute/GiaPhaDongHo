package vn.giapha.donation.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Component;

/**
 * Sinh URL ảnh VietQR động từ JSON {@code vietqrPayload} trên chiến dịch.
 *
 * <pre>
 * {"bankBin":"970418","accountNo":"0123456789","accountName":"HOI DONG HO"}
 * </pre>
 */
@Component
public class VietQrBuilder {

    private final ObjectMapper objectMapper;

    public VietQrBuilder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String buildImageUrl(String vietqrPayloadJson, BigDecimal amount, String addInfo) {
        if (vietqrPayloadJson == null || vietqrPayloadJson.isBlank()) {
            return null;
        }
        try {
            JsonNode n = objectMapper.readTree(vietqrPayloadJson.trim());
            String bankBin = text(n, "bankBin", "bankId", "bin");
            String accountNo = text(n, "accountNo", "accountNumber");
            String accountName = text(n, "accountName", "account_name");
            if (bankBin == null || accountNo == null) {
                return null;
            }
            String template = text(n, "template");
            if (template == null || template.isBlank()) {
                template = "compact2";
            }
            StringBuilder url = new StringBuilder("https://img.vietqr.io/image/")
                .append(encodePath(bankBin))
                .append('-')
                .append(encodePath(accountNo))
                .append('-')
                .append(encodePath(template))
                .append(".png?");
            boolean first = true;
            if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
                url.append("amount=").append(amount.setScale(0, RoundingMode.HALF_UP).toPlainString());
                first = false;
            }
            if (addInfo != null && !addInfo.isBlank()) {
                if (!first) {
                    url.append('&');
                }
                url.append("addInfo=").append(URLEncoder.encode(addInfo.trim(), StandardCharsets.UTF_8));
                first = false;
            }
            if (accountName != null && !accountName.isBlank()) {
                if (!first) {
                    url.append('&');
                }
                url.append("accountName=").append(URLEncoder.encode(accountName.trim(), StandardCharsets.UTF_8));
            }
            return url.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private static String text(JsonNode n, String... keys) {
        for (String k : keys) {
            JsonNode v = n.get(k);
            if (v != null && !v.isNull() && !v.asText().isBlank()) {
                return v.asText().trim();
            }
        }
        return null;
    }

    private static String encodePath(String raw) {
        return URLEncoder.encode(raw, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
