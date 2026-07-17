package vn.giapha.genealogy.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Locale;
import org.springframework.stereotype.Component;
import vn.giapha.core.security.SettingsSecretCipher;
import vn.giapha.domain.FamilyTree;
import vn.giapha.genealogy.api.TreeSettingsDTO;

@Component
public class TreeSettingsCodec {

    private final ObjectMapper objectMapper;
    private final SettingsSecretCipher secretCipher;

    public TreeSettingsCodec(ObjectMapper objectMapper, SettingsSecretCipher secretCipher) {
        this.objectMapper = objectMapper;
        this.secretCipher = secretCipher;
    }

    public TreeSettingsDTO read(FamilyTree tree) {
        TreeSettingsDTO dto = parse(tree);
        sanitizeForClient(dto);
        return dto;
    }

    /** Bản đầy đủ (secret đã giải mã) — chỉ dùng nội bộ service. */
    public TreeSettingsDTO readInternal(FamilyTree tree) {
        TreeSettingsDTO dto = parse(tree);
        revealSecrets(dto);
        return dto;
    }

    public void write(FamilyTree tree, TreeSettingsDTO incoming) {
        TreeSettingsDTO previous = parse(tree);
        mergeSecrets(incoming, previous);
        protectSecrets(incoming);
        String display = incoming.getDisplayName() != null ? incoming.getDisplayName().trim() : "";
        tree.setSurname(extractSurname(display, tree.getSurname()));
        tree.setBranchName(extractBranch(display, tree.getBranchName()));
        if (incoming.getProvinceCode() != null) {
            String p = incoming.getProvinceCode().trim();
            tree.setProvinceCode(p.isEmpty() ? null : p);
        }
        incoming.setSlug(tree.getSlug());
        clearClientOnlyFlags(incoming);
        try {
            tree.setMetaJson(objectMapper.writeValueAsString(incoming));
        } catch (Exception e) {
            throw new IllegalStateException("Không ghi được cấu hình cây", e);
        }
    }

    private TreeSettingsDTO parse(FamilyTree tree) {
        TreeSettingsDTO dto = new TreeSettingsDTO();
        dto.setSlug(tree.getSlug());
        if (tree.getMetaJson() != null && !tree.getMetaJson().isBlank()) {
            try {
                dto = objectMapper.readValue(tree.getMetaJson(), TreeSettingsDTO.class);
            } catch (Exception ignored) {
                dto = new TreeSettingsDTO();
            }
        }
        dto.setSlug(tree.getSlug());
        ensureDefaults(dto, tree);
        return dto;
    }

    private void protectSecrets(TreeSettingsDTO dto) {
        if (dto.getSmtp() != null && dto.getSmtp().getPassword() != null) {
            dto.getSmtp().setPassword(secretCipher.protect(dto.getSmtp().getPassword()));
        }
        if (dto.getZalo() != null && dto.getZalo().getAccessToken() != null) {
            dto.getZalo().setAccessToken(secretCipher.protect(dto.getZalo().getAccessToken()));
        }
        if (dto.getWebhook() != null && dto.getWebhook().getSecret() != null) {
            dto.getWebhook().setSecret(secretCipher.protect(dto.getWebhook().getSecret()));
        }
    }

    private void revealSecrets(TreeSettingsDTO dto) {
        if (dto.getSmtp() != null && dto.getSmtp().getPassword() != null) {
            dto.getSmtp().setPassword(secretCipher.reveal(dto.getSmtp().getPassword()));
        }
        if (dto.getZalo() != null && dto.getZalo().getAccessToken() != null) {
            dto.getZalo().setAccessToken(secretCipher.reveal(dto.getZalo().getAccessToken()));
        }
        if (dto.getWebhook() != null && dto.getWebhook().getSecret() != null) {
            dto.getWebhook().setSecret(secretCipher.reveal(dto.getWebhook().getSecret()));
        }
    }

    private void ensureDefaults(TreeSettingsDTO dto, FamilyTree tree) {
        if (dto.getDisplayName() == null || dto.getDisplayName().isBlank()) {
            dto.setDisplayName(composeDisplayName(tree));
        }
        if (dto.getProvinceCode() == null || dto.getProvinceCode().isBlank()) {
            dto.setProvinceCode(tree.getProvinceCode());
        }
        if (dto.getTree() == null) {
            dto.setTree(new TreeSettingsDTO.TreeFeatureSettings());
        }
        if (dto.getNotify() == null) {
            dto.setNotify(new TreeSettingsDTO.NotifySettings());
        }
        if (dto.getCalendar() == null) {
            dto.setCalendar(new TreeSettingsDTO.CalendarSettings());
        }
        if (dto.getAuth() == null) {
            dto.setAuth(new TreeSettingsDTO.AuthSettings());
        }
        if (dto.getPrivacy() == null) {
            dto.setPrivacy(new TreeSettingsDTO.PrivacySettings());
        }
        if (dto.getSmtp() == null) {
            dto.setSmtp(new TreeSettingsDTO.SmtpSettings());
        }
        if (dto.getZalo() == null) {
            dto.setZalo(new TreeSettingsDTO.ZaloSettings());
        }
        if (dto.getWebhook() == null) {
            dto.setWebhook(new TreeSettingsDTO.WebhookSettings());
        }
        if (dto.getBackup() == null) {
            dto.setBackup(new TreeSettingsDTO.BackupSettings());
        }
        if (dto.getSeoKeywords() == null) {
            dto.setSeoKeywords(new ArrayList<>());
        }
        if (dto.getBrandPalette() == null || dto.getBrandPalette().isBlank()) {
            dto.setBrandPalette("bang-vang");
        }
        String prefix = dto.getTree().getCodePrefix();
        if (prefix == null || prefix.isBlank()) {
            dto.getTree().setCodePrefix("A");
        } else {
            dto.getTree().setCodePrefix(prefix.trim().toUpperCase(Locale.ROOT));
        }
        String priv = dto.getPrivacy().getDefaultLivingPrivacy();
        if (priv == null || priv.isBlank()) {
            dto.getPrivacy().setDefaultLivingPrivacy("members");
        }
    }

    private static void sanitizeForClient(TreeSettingsDTO dto) {
        if (dto.getSmtp() != null) {
            boolean hasPw = dto.getSmtp().getPassword() != null && !dto.getSmtp().getPassword().isBlank();
            boolean hasHost = dto.getSmtp().getHost() != null && !dto.getSmtp().getHost().isBlank();
            dto.getSmtp().setConfigured(hasPw || hasHost);
            dto.getSmtp().setPassword(null);
        }
        if (dto.getZalo() != null) {
            boolean hasTok = dto.getZalo().getAccessToken() != null && !dto.getZalo().getAccessToken().isBlank();
            dto.getZalo().setConfigured(hasTok);
            dto.getZalo().setAccessToken(null);
        }
        if (dto.getWebhook() != null) {
            boolean hasSec = dto.getWebhook().getSecret() != null && !dto.getWebhook().getSecret().isBlank();
            dto.getWebhook().setSecretConfigured(hasSec);
            dto.getWebhook().setSecret(null);
        }
    }

    private static void clearClientOnlyFlags(TreeSettingsDTO dto) {
        if (dto.getSmtp() != null) {
            dto.getSmtp().setConfigured(false);
        }
        if (dto.getZalo() != null) {
            dto.getZalo().setConfigured(false);
        }
        if (dto.getWebhook() != null) {
            dto.getWebhook().setSecretConfigured(false);
        }
    }

    private static void mergeSecrets(TreeSettingsDTO incoming, TreeSettingsDTO previous) {
        if (incoming.getSmtp() == null) {
            incoming.setSmtp(previous.getSmtp());
        } else if (
            (incoming.getSmtp().getPassword() == null || incoming.getSmtp().getPassword().isBlank()) &&
            previous.getSmtp() != null
        ) {
            incoming.getSmtp().setPassword(previous.getSmtp().getPassword());
        }
        if (incoming.getZalo() == null) {
            incoming.setZalo(previous.getZalo());
        } else if (
            (incoming.getZalo().getAccessToken() == null || incoming.getZalo().getAccessToken().isBlank()) &&
            previous.getZalo() != null
        ) {
            incoming.getZalo().setAccessToken(previous.getZalo().getAccessToken());
        }
        if (incoming.getWebhook() == null) {
            incoming.setWebhook(previous.getWebhook());
        } else if (
            (incoming.getWebhook().getSecret() == null || incoming.getWebhook().getSecret().isBlank()) &&
            previous.getWebhook() != null
        ) {
            incoming.getWebhook().setSecret(previous.getWebhook().getSecret());
        }
    }

    private static String composeDisplayName(FamilyTree tree) {
        java.util.List<String> parts = new ArrayList<>();
        if (tree.getSurname() != null && !tree.getSurname().isBlank()) {
            parts.add(tree.getSurname().trim());
        }
        if (tree.getBranchName() != null && !tree.getBranchName().isBlank()) {
            parts.add(tree.getBranchName().trim());
        }
        if (parts.isEmpty()) {
            return tree.getSlug() != null ? tree.getSlug() : "Gia phả";
        }
        return String.join(" ", parts);
    }

    private static String extractSurname(String display, String fallback) {
        if (display == null || display.isBlank()) {
            return fallback;
        }
        String[] parts = display.trim().split("\\s+", 2);
        return parts[0];
    }

    private static String extractBranch(String display, String fallback) {
        if (display == null || display.isBlank()) {
            return fallback;
        }
        String[] parts = display.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : fallback;
    }
}
