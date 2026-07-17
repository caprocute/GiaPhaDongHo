package vn.giapha.iam.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Kết nối Admin API máy chủ đăng nhập (DEV: tài khoản quản trị bootstrap).
 * Secret chỉ qua env / Jasypt — không commit.
 */
@ConfigurationProperties(prefix = "giapha.keycloak-admin")
public class KeycloakAdminProperties {

    /** VD http://localhost:18086 — suy ra từ issuer nếu để trống. */
    private String serverUrl = "";

    private String realm = "jhipster";

    /** Realm lấy token admin — mặc định master. */
    private String tokenRealm = "master";

    private String clientId = "admin-cli";

    private String clientSecret = "";

    private String username = "";

    private String password = "";

    /** Tắt toàn bộ quản trị tài khoản (dry / chưa cấu hình). */
    private boolean enabled = true;

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public String getTokenRealm() {
        return tokenRealm;
    }

    public void setTokenRealm(String tokenRealm) {
        this.tokenRealm = tokenRealm;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
