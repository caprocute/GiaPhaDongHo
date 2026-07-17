package vn.giapha.core.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SettingsSecretCipherUnitTest {

    @Test
    void protectAndRevealRoundTripWhenPasswordSet() {
        SettingsSecretCipher cipher = new SettingsSecretCipher("test-master-password-rp4");
        cipher.init();
        assertThat(cipher.isReady()).isTrue();
        String enc = cipher.protect("smtp-secret");
        assertThat(enc).startsWith("ENC(").endsWith(")");
        assertThat(cipher.reveal(enc)).isEqualTo("smtp-secret");
        assertThat(cipher.protect(enc)).isEqualTo(enc);
    }

    @Test
    void withoutPasswordKeepsPlaintext() {
        SettingsSecretCipher cipher = new SettingsSecretCipher("");
        cipher.init();
        assertThat(cipher.isReady()).isFalse();
        assertThat(cipher.protect("plain")).isEqualTo("plain");
        assertThat(cipher.reveal("plain")).isEqualTo("plain");
    }
}
