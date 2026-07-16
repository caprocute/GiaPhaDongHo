package vn.giapha.iam.internal;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.security.SecurityUtils;

/**
 * Enforce {@link RequiresPermission} theo ma trận role → permission (R1.5).
 */
@Aspect
@Component
public class RequiresPermissionAspect {

    private final CurrentUserService currentUserService;

    public RequiresPermissionAspect(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @Before("@annotation(requiresPermission)")
    public void enforce(RequiresPermission requiresPermission) {
        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập cho quyền: " + requiresPermission.value());
        }
        if (!currentUserService.currentUserHasPermission(requiresPermission.value())) {
            throw new AccessDeniedException("Thiếu quyền: " + requiresPermission.value());
        }
    }
}
