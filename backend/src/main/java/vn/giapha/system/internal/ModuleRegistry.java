package vn.giapha.system.internal;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "module_registry")
public class ModuleRegistry implements Serializable {
    @Id
    @Column(name = "code", length = 64)
    private String code;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Lob
    @Column(name = "config_json")
    private String configJson;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }
}
