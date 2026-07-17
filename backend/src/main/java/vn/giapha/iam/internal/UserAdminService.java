package vn.giapha.iam.internal;

import java.util.List;
import org.springframework.stereotype.Service;
import vn.giapha.iam.api.LoginEventDTO;
import vn.giapha.iam.api.ManagedUserDTO;
import vn.giapha.iam.api.RealmRoles;
import vn.giapha.iam.api.RoleOptionDTO;

@Service
public class UserAdminService {

    private final KeycloakAdminClient client;

    public UserAdminService(KeycloakAdminClient client) {
        this.client = client;
    }

    public boolean isAvailable() {
        return client.isConfigured();
    }

    public List<ManagedUserDTO> list(String q, Boolean enabled, int page, int size) {
        requireConfigured();
        int first = Math.max(0, page) * Math.max(1, size);
        return client.searchUsers(q, enabled, first, size);
    }

    public ManagedUserDTO get(String id) {
        requireConfigured();
        return client.getUser(id);
    }

    public ManagedUserDTO approve(String id) {
        requireConfigured();
        client.approve(id);
        return client.getUser(id);
    }

    public ManagedUserDTO lock(String id) {
        requireConfigured();
        client.setEnabled(id, false);
        return client.getUser(id);
    }

    public ManagedUserDTO activate(String id) {
        requireConfigured();
        client.setEnabled(id, true);
        return client.getUser(id);
    }

    public ManagedUserDTO setRoles(String id, List<String> roles) {
        requireConfigured();
        client.replaceRealmRoles(id, roles);
        return client.getUser(id);
    }

    public void resetPassword(String id, String temporaryPassword) {
        requireConfigured();
        client.resetPassword(id, temporaryPassword, true);
    }

    public List<LoginEventDTO> loginHistory(String id) {
        requireConfigured();
        return client.loginHistory(id, 30);
    }

    public List<RoleOptionDTO> roleCatalog() {
        return List.of(
            new RoleOptionDTO(
                RealmRoles.ADMIN,
                "Quản trị hệ thống",
                "Toàn quyền cấu hình, thành viên, quỹ, duyệt và phả hệ"
            ),
            new RoleOptionDTO(
                RealmRoles.GENEALOGY_ADMIN,
                "Quản trị phả hệ",
                "Sửa cây, người, hôn nhân; duyệt tự khai; xem nhật ký liên quan"
            ),
            new RoleOptionDTO(
                RealmRoles.EDITOR,
                "Biên tập viên",
                "Sửa hồ sơ và tin tức được giao; không đổi cấu hình hệ thống"
            ),
            new RoleOptionDTO(RealmRoles.MEMBER, "Thành viên", "Xem phả đồ theo quyền riêng tư; tự khai; đăng ký nhắc giỗ"),
            new RoleOptionDTO(RealmRoles.USER, "Người dùng cơ bản", "Quyền tối thiểu trên cổng thông tin")
        );
    }

    private void requireConfigured() {
        if (!client.isConfigured()) {
            throw new IllegalStateException(
                "Chưa cấu hình quản trị tài khoản. Liên hệ quản trị hệ thống để kết nối máy chủ đăng nhập."
            );
        }
    }
}
