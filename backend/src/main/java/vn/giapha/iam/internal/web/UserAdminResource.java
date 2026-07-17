package vn.giapha.iam.internal.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.iam.api.LoginEventDTO;
import vn.giapha.iam.api.ManagedUserDTO;
import vn.giapha.iam.api.RoleOptionDTO;
import vn.giapha.iam.internal.UserAdminService;
import vn.giapha.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/v1/admin/users")
public class UserAdminResource {

    private final UserAdminService userAdminService;

    public UserAdminResource(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping("/status")
    @RequiresPermission("iam:user:read")
    public Map<String, Object> status() {
        return Map.of("available", userAdminService.isAvailable());
    }

    @GetMapping("/roles")
    @RequiresPermission("iam:user:read")
    public List<RoleOptionDTO> roles() {
        return userAdminService.roleCatalog();
    }

    @GetMapping
    @RequiresPermission("iam:user:read")
    public List<ManagedUserDTO> list(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Boolean enabled,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        try {
            return userAdminService.list(q, enabled, page, size);
        } catch (IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "user", "unavailable");
        }
    }

    @GetMapping("/{id}")
    @RequiresPermission("iam:user:read")
    public ManagedUserDTO get(@PathVariable String id) {
        try {
            return userAdminService.get(id);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "user", "notfound");
        } catch (IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "user", "unavailable");
        }
    }

    @PostMapping("/{id}/approve")
    @RequiresPermission("iam:user:write")
    public ManagedUserDTO approve(@PathVariable String id) {
        return mutate(() -> userAdminService.approve(id));
    }

    @PostMapping("/{id}/lock")
    @RequiresPermission("iam:user:write")
    public ManagedUserDTO lock(@PathVariable String id) {
        return mutate(() -> userAdminService.lock(id));
    }

    @PostMapping("/{id}/activate")
    @RequiresPermission("iam:user:write")
    public ManagedUserDTO activate(@PathVariable String id) {
        return mutate(() -> userAdminService.activate(id));
    }

    @PutMapping("/{id}/roles")
    @RequiresPermission("iam:user:write")
    public ManagedUserDTO setRoles(@PathVariable String id, @RequestBody RolesBody body) {
        return mutate(() -> userAdminService.setRoles(id, body == null ? List.of() : body.roles()));
    }

    @PostMapping("/{id}/reset-password")
    @RequiresPermission("iam:user:write")
    public ResponseEntity<Map<String, String>> resetPassword(
        @PathVariable String id,
        @Valid @RequestBody ResetPasswordBody body
    ) {
        try {
            userAdminService.resetPassword(id, body.temporaryPassword());
            return ResponseEntity.ok(Map.of("message", "Đã đặt mật khẩu tạm. Người dùng phải đổi khi đăng nhập lại."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "user", "reset");
        }
    }

    @GetMapping("/{id}/login-history")
    @RequiresPermission("iam:user:read")
    public List<LoginEventDTO> loginHistory(@PathVariable String id) {
        try {
            return userAdminService.loginHistory(id);
        } catch (IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "user", "unavailable");
        }
    }

    private ManagedUserDTO mutate(java.util.function.Supplier<ManagedUserDTO> action) {
        try {
            return action.get();
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "user", "notfound");
        } catch (IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "user", "unavailable");
        }
    }

    public record RolesBody(List<String> roles) {}

    public record ResetPasswordBody(
        @NotBlank @Size(min = 8, max = 128) String temporaryPassword
    ) {}
}
