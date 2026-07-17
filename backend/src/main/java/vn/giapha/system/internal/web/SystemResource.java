package vn.giapha.system.internal.web;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.system.internal.AuditLog;
import vn.giapha.system.internal.ModuleRegistry;
import vn.giapha.system.internal.SystemService;
import vn.giapha.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/v1/system")
public class SystemResource {

    private final SystemService systemService;

    public SystemResource(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/modules")
    @RequiresPermission("system:module:read")
    public List<ModuleRegistry> modules() {
        return systemService.listModules();
    }

    @PutMapping("/modules/{code}")
    @RequiresPermission("system:module:write")
    public ModuleRegistry toggle(@PathVariable String code, @RequestBody Map<String, Boolean> body) {
        try {
            boolean enabled = body != null && Boolean.TRUE.equals(body.get("enabled"));
            return systemService.setEnabled(code, enabled);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "moduleRegistry", "invalid");
        }
    }

    @GetMapping("/audit-logs")
    @RequiresPermission("system:audit:read")
    public List<AuditLog> audit() {
        return systemService.recentAudit();
    }

    @GetMapping("/dashboard")
    @RequiresPermission("system:dashboard:read")
    public Map<String, Object> dashboard(@RequestParam("tree") String treeSlug) {
        try {
            return systemService.dashboardStats(treeSlug);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "dashboard", "invalid");
        }
    }
}
