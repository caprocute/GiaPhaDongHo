package vn.giapha.core.security;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Bắt buộc khai báo quyền trên endpoint (TK-10). Aspect kiểm tra ở {@code vn.giapha.security}.
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresPermission {
    /** Dạng {@code module:entity:action}, ví dụ {@code genealogy:person:write}. */
    String value();
}
