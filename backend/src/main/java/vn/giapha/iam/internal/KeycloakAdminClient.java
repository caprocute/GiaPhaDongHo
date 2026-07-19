package vn.giapha.iam.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.giapha.iam.api.LoginEventDTO;
import vn.giapha.iam.api.ManagedUserDTO;
import vn.giapha.iam.api.RealmRoles;

/**
 * HTTP client tới Admin REST của máy chủ đăng nhập — không phụ thuộc SDK Keycloak.
 */
@Component
public class KeycloakAdminClient {

    private static final Logger LOG = LoggerFactory.getLogger(KeycloakAdminClient.class);
    private static final Set<String> ASSIGNABLE = Set.of(
        RealmRoles.ADMIN,
        RealmRoles.GENEALOGY_ADMIN,
        RealmRoles.EDITOR,
        RealmRoles.MEMBER,
        RealmRoles.USER
    );

    private final KeycloakAdminProperties props;
    private final ObjectMapper objectMapper;
    private final String issuerUri;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    private String cachedToken;
    private Instant tokenExpiry = Instant.EPOCH;

    public KeycloakAdminClient(
        KeycloakAdminProperties props,
        ObjectMapper objectMapper,
        @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}") String issuerUri
    ) {
        this.props = props;
        this.objectMapper = objectMapper;
        this.issuerUri = issuerUri == null ? "" : issuerUri;
    }

    public boolean isConfigured() {
        if (!props.isEnabled()) {
            return false;
        }
        boolean hasPassword = props.getUsername() != null &&
            !props.getUsername().isBlank() &&
            props.getPassword() != null &&
            !props.getPassword().isBlank();
        boolean hasSecret = props.getClientSecret() != null && !props.getClientSecret().isBlank();
        return hasPassword || hasSecret;
    }

    public List<ManagedUserDTO> searchUsers(String query, Boolean enabled, int first, int max) {
        StringBuilder path = new StringBuilder("/admin/realms/")
            .append(enc(props.getRealm()))
            .append("/users?briefRepresentation=true&first=")
            .append(Math.max(0, first))
            .append("&max=")
            .append(Math.min(100, Math.max(1, max)));
        if (query != null && !query.isBlank()) {
            path.append("&search=").append(enc(query.trim()));
        }
        if (enabled != null) {
            path.append("&enabled=").append(enabled);
        }
        JsonNode arr = getJson(path.toString());
        List<ManagedUserDTO> out = new ArrayList<>();
        if (arr != null && arr.isArray()) {
            for (JsonNode n : arr) {
                ManagedUserDTO u = toUser(n);
                u.setRealmRoles(listRealmRoles(u.getId()));
                out.add(u);
            }
        }
        return out;
    }

    public ManagedUserDTO getUser(String id) {
        JsonNode n = getJson("/admin/realms/" + enc(props.getRealm()) + "/users/" + enc(id));
        if (n == null || n.isMissingNode() || n.path("id").isMissingNode()) {
            throw new IllegalArgumentException("Không tìm thấy tài khoản.");
        }
        ManagedUserDTO u = toUser(n);
        u.setRealmRoles(listRealmRoles(id));
        return u;
    }

    public void setEnabled(String id, boolean enabled) {
        ManagedUserDTO current = getUser(id);
        ObjectNode body = objectMapper.createObjectNode();
        body.put("id", id);
        body.put("username", current.getUsername() != null ? current.getUsername() : id);
        body.put("enabled", enabled);
        if (current.getEmail() != null) {
            body.put("email", current.getEmail());
        }
        if (current.getFirstName() != null) {
            body.put("firstName", current.getFirstName());
        }
        if (current.getLastName() != null) {
            body.put("lastName", current.getLastName());
        }
        body.put("emailVerified", current.isEmailVerified());
        putJson("/admin/realms/" + enc(props.getRealm()) + "/users/" + enc(id), body);
    }

    public void approve(String id) {
        setEnabled(id, true);
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("emailVerified", true);
            // PUT full representation safer via get + patch fields
            ManagedUserDTO current = getUser(id);
            ObjectNode full = objectMapper.createObjectNode();
            full.put("id", id);
            full.put("username", current.getUsername());
            full.put("enabled", true);
            full.put("emailVerified", true);
            if (current.getEmail() != null) {
                full.put("email", current.getEmail());
            }
            if (current.getFirstName() != null) {
                full.put("firstName", current.getFirstName());
            }
            if (current.getLastName() != null) {
                full.put("lastName", current.getLastName());
            }
            putJson("/admin/realms/" + enc(props.getRealm()) + "/users/" + enc(id), full);
        } catch (Exception e) {
            LOG.debug("approve emailVerified: {}", e.getMessage());
        }
    }

    public void replaceRealmRoles(String userId, List<String> desiredRoles) {
        List<String> wanted = desiredRoles == null
            ? List.of()
            : desiredRoles
                .stream()
                .map(this::normalizeRole)
                .filter(ASSIGNABLE::contains)
                .distinct()
                .toList();

        List<String> current = listRealmRoles(userId)
            .stream()
            .filter(ASSIGNABLE::contains)
            .toList();

        List<String> toAdd = wanted.stream().filter(r -> !current.contains(r)).toList();
        List<String> toRemove = current.stream().filter(r -> !wanted.contains(r)).toList();

        if (!toRemove.isEmpty()) {
            ArrayNode arr = rolesPayload(toRemove);
            deleteJson("/admin/realms/" + enc(props.getRealm()) + "/users/" + enc(userId) + "/role-mappings/realm", arr);
        }
        if (!toAdd.isEmpty()) {
            ArrayNode arr = rolesPayload(toAdd);
            postJson("/admin/realms/" + enc(props.getRealm()) + "/users/" + enc(userId) + "/role-mappings/realm", arr);
        }
    }

    public void resetPassword(String userId, String temporaryPassword, boolean temporary) {
        if (temporaryPassword == null || temporaryPassword.isBlank()) {
            throw new IllegalArgumentException("Nhập mật khẩu tạm.");
        }
        if (temporaryPassword.length() < 8) {
            throw new IllegalArgumentException("Mật khẩu tạm cần ít nhất 8 ký tự.");
        }
        ObjectNode body = objectMapper.createObjectNode();
        body.put("type", "password");
        body.put("value", temporaryPassword);
        body.put("temporary", temporary);
        putJson("/admin/realms/" + enc(props.getRealm()) + "/users/" + enc(userId) + "/reset-password", body);
    }

    public List<LoginEventDTO> loginHistory(String userId, int max) {
        try {
            String path =
                "/admin/realms/" +
                enc(props.getRealm()) +
                "/events?type=LOGIN&type=LOGIN_ERROR&user=" +
                enc(userId) +
                "&max=" +
                Math.min(50, Math.max(1, max));
            JsonNode arr = getJson(path);
            List<LoginEventDTO> out = new ArrayList<>();
            if (arr != null && arr.isArray()) {
                for (JsonNode n : arr) {
                    out.add(
                        new LoginEventDTO(
                            text(n, "type"),
                            n.path("time").isNumber() ? n.path("time").asLong() : null,
                            text(n, "ipAddress"),
                            text(n, "error")
                        )
                    );
                }
            }
            return out;
        } catch (Exception e) {
            LOG.info("Không đọc được lịch sử đăng nhập (có thể chưa bật sự kiện): {}", e.getMessage());
            return List.of();
        }
    }

    public List<String> listRealmRoles(String userId) {
        JsonNode arr = getJson(
            "/admin/realms/" + enc(props.getRealm()) + "/users/" + enc(userId) + "/role-mappings/realm"
        );
        if (arr == null || !arr.isArray()) {
            return List.of();
        }
        return StreamSupport.stream(arr.spliterator(), false)
            .map(n -> text(n, "name"))
            .filter(n -> n != null && ASSIGNABLE.contains(n))
            .sorted()
            .collect(Collectors.toList());
    }

    private ArrayNode rolesPayload(List<String> roleNames) {
        ArrayNode arr = objectMapper.createArrayNode();
        for (String name : roleNames) {
            JsonNode role = findRealmRole(name);
            if (role != null) {
                ObjectNode item = objectMapper.createObjectNode();
                item.put("id", role.path("id").asText());
                item.put("name", role.path("name").asText());
                arr.add(item);
            } else {
                LOG.warn("Không tìm thấy nhóm quyền {}", name);
            }
        }
        return arr;
    }

    private JsonNode findRealmRole(String name) {
        return getJson("/admin/realms/" + enc(props.getRealm()) + "/roles/" + enc(name));
    }

    private ManagedUserDTO toUser(JsonNode n) {
        ManagedUserDTO u = new ManagedUserDTO();
        u.setId(text(n, "id"));
        u.setUsername(text(n, "username"));
        u.setEmail(text(n, "email"));
        u.setFirstName(text(n, "firstName"));
        u.setLastName(text(n, "lastName"));
        String fn = u.getFirstName() == null ? "" : u.getFirstName();
        String ln = u.getLastName() == null ? "" : u.getLastName();
        String display = (fn + " " + ln).trim();
        if (display.isEmpty()) {
            display = u.getUsername() != null ? u.getUsername() : u.getEmail();
        }
        u.setDisplayName(display);
        u.setEnabled(n.path("enabled").asBoolean(true));
        u.setEmailVerified(n.path("emailVerified").asBoolean(false));
        if (n.path("createdTimestamp").isNumber()) {
            u.setCreatedTimestamp(n.path("createdTimestamp").asLong());
        }
        return u;
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return "";
        }
        String r = role.trim();
        if (!r.startsWith("ROLE_")) {
            return "ROLE_" + r.toUpperCase(Locale.ROOT);
        }
        return r;
    }

    private synchronized String accessToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry.minusSeconds(30))) {
            return cachedToken;
        }
        if (!isConfigured()) {
            throw new IllegalStateException(
                "Chưa cấu hình kết nối quản trị tài khoản. Liên hệ quản trị hệ thống."
            );
        }
        String tokenUrl =
            baseUrl() + "/realms/" + enc(blank(props.getTokenRealm(), "master")) + "/protocol/openid-connect/token";
        String body;
        if (props.getClientSecret() != null && !props.getClientSecret().isBlank()) {
            body =
                "grant_type=client_credentials&client_id=" +
                enc(props.getClientId()) +
                "&client_secret=" +
                enc(props.getClientSecret());
        } else {
            body =
                "grant_type=password&client_id=" +
                enc(blank(props.getClientId(), "admin-cli")) +
                "&username=" +
                enc(props.getUsername()) +
                "&password=" +
                enc(props.getPassword());
        }
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(tokenUrl))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (res.statusCode() >= 300) {
                LOG.warn("Lấy token quản trị thất bại http={}", res.statusCode());
                throw new IllegalStateException("Không kết nối được máy chủ đăng nhập để quản trị tài khoản.");
            }
            JsonNode json = objectMapper.readTree(res.body());
            cachedToken = json.path("access_token").asText(null);
            int expires = json.path("expires_in").asInt(60);
            tokenExpiry = Instant.now().plusSeconds(Math.max(30, expires));
            if (cachedToken == null || cachedToken.isBlank()) {
                throw new IllegalStateException("Máy chủ đăng nhập không trả mã truy cập.");
            }
            return cachedToken;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Không kết nối được máy chủ đăng nhập để quản trị tài khoản.");
        }
    }

    private JsonNode getJson(String path) {
        return exchange("GET", path, null);
    }

    private void putJson(String path, JsonNode body) {
        exchange("PUT", path, body);
    }

    private void postJson(String path, JsonNode body) {
        exchange("POST", path, body);
    }

    private void deleteJson(String path, JsonNode body) {
        exchange("DELETE", path, body);
    }

    private JsonNode exchange(String method, String path, JsonNode body) {
        try {
            HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(baseUrl() + path))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + accessToken())
                .header("Accept", "application/json");
            String payload = body == null ? "" : objectMapper.writeValueAsString(body);
            switch (method) {
                case "GET" -> b.GET();
                case "PUT" -> b.header("Content-Type", "application/json").PUT(
                    HttpRequest.BodyPublishers.ofString(payload)
                );
                case "POST" -> b.header("Content-Type", "application/json").POST(
                    HttpRequest.BodyPublishers.ofString(payload)
                );
                case "DELETE" -> {
                    if (body != null) {
                        b.header("Content-Type", "application/json").method(
                            "DELETE",
                            HttpRequest.BodyPublishers.ofString(payload)
                        );
                    } else {
                        b.DELETE();
                    }
                }
                default -> throw new IllegalArgumentException(method);
            }
            HttpResponse<String> res = http.send(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (res.statusCode() == 401 || res.statusCode() == 403) {
                cachedToken = null;
                throw new IllegalStateException("Không đủ quyền quản trị tài khoản trên máy chủ đăng nhập.");
            }
            if (res.statusCode() == 404) {
                return null;
            }
            if (res.statusCode() >= 300) {
                LOG.warn("Admin API {} {} → {} {}", method, path, res.statusCode(), truncate(res.body()));
                throw new IllegalStateException("Thao tác tài khoản không thành công.");
            }
            if (res.body() == null || res.body().isBlank()) {
                return objectMapper.createObjectNode();
            }
            return objectMapper.readTree(res.body());
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            LOG.warn("Admin API error: {}", e.getMessage());
            throw new IllegalStateException("Không kết nối được máy chủ đăng nhập.");
        }
    }

    private String baseUrl() {
        String configured = props.getServerUrl();
        if (configured != null && !configured.isBlank()) {
            return trimSlash(configured.trim());
        }
        if (issuerUri != null && issuerUri.contains("/realms/")) {
            return trimSlash(issuerUri.substring(0, issuerUri.indexOf("/realms/")));
        }
        return "http://localhost:18086";
    }

    private static String blank(String v, String fallback) {
        return v == null || v.isBlank() ? fallback : v;
    }

    private static String trimSlash(String s) {
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }

    private static String enc(String s) {
        return URLEncoder.encode(s == null ? "" : s, StandardCharsets.UTF_8);
    }

    private static String text(JsonNode n, String key) {
        JsonNode v = n.get(key);
        return v == null || v.isNull() ? null : v.asText();
    }

    private static String truncate(String s) {
        if (s == null) {
            return "";
        }
        return s.length() > 180 ? s.substring(0, 180) + "…" : s;
    }
}
