package vn.giapha.security;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import vn.giapha.core.security.RequiresPermission;

/**
 * Gate tối thiểu cho {@link RequiresPermission}: yêu cầu đã đăng nhập.
 * Ma trận permission đầy đủ (module:entity:action) bổ sung ở R1.5 IAM.
 */
@Aspect
@Component
public class RequiresPermissionAspect {

    @Before("@annotation(requiresPermission)")
    public void enforce(RequiresPermission requiresPermission) {
        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập cho quyền: " + requiresPermission.value());
        }
    }
}
