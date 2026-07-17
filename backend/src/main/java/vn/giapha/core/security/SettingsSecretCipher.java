package vn.giapha.core.security;

import jakarta.annotation.PostConstruct;
import org.jasypt.encryption.pbe.PBEStringEncryptor;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.iv.RandomIvGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Mã hóa secret trong metaJson / cấu hình — dùng Jasypt (CLAUDE.md).
 * Master password: {@code JASYPT_ENCRYPTOR_PASSWORD}. Dev thiếu password → giữ plaintext + cảnh báo log.
 */
@Component
public class SettingsSecretCipher {

    private static final Logger LOG = LoggerFactory.getLogger(SettingsSecretCipher.class);
    private static final String PREFIX = "ENC(";
    private static final String SUFFIX = ")";

    private final String masterPassword;
    private PBEStringEncryptor encryptor;

    public SettingsSecretCipher(
        @Value("${jasypt.encryptor.password:${JASYPT_ENCRYPTOR_PASSWORD:}}") String masterPassword
    ) {
        this.masterPassword = masterPassword == null ? "" : masterPassword.trim();
    }

    @PostConstruct
    void init() {
        if (masterPassword.isEmpty()) {
            LOG.warn(
                "JASYPT_ENCRYPTOR_PASSWORD chưa đặt — secret trong cấu hình dòng họ lưu plaintext (chỉ chấp nhận DEV)."
            );
            return;
        }
        StandardPBEStringEncryptor e = new StandardPBEStringEncryptor();
        e.setPassword(masterPassword);
        e.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        e.setIvGenerator(new RandomIvGenerator());
        e.setKeyObtentionIterations(1000);
        this.encryptor = e;
        LOG.info("SettingsSecretCipher sẵn sàng (Jasypt).");
    }

    public boolean isReady() {
        return encryptor != null;
    }

    public static boolean isWrapped(String value) {
        return value != null && value.startsWith(PREFIX) && value.endsWith(SUFFIX);
    }

    /** Mã hóa plaintext → ENC(...). Giá trị đã ENC giữ nguyên. */
    public String protect(String plainOrEnc) {
        if (plainOrEnc == null || plainOrEnc.isBlank()) {
            return plainOrEnc;
        }
        if (isWrapped(plainOrEnc)) {
            return plainOrEnc;
        }
        if (encryptor == null) {
            return plainOrEnc;
        }
        return PREFIX + encryptor.encrypt(plainOrEnc) + SUFFIX;
    }

    /** Giải ENC(...) → plaintext; giá trị thường trả nguyên. */
    public String reveal(String stored) {
        if (stored == null || stored.isBlank() || !isWrapped(stored)) {
            return stored;
        }
        if (encryptor == null) {
            throw new IllegalStateException(
                "Cấu hình đã mã hóa nhưng thiếu mật khẩu máy chủ — không đọc được bí mật."
            );
        }
        String cipher = stored.substring(PREFIX.length(), stored.length() - SUFFIX.length());
        return encryptor.decrypt(cipher);
    }
}
