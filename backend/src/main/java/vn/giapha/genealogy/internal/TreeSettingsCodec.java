package vn.giapha.genealogy.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;
import vn.giapha.domain.FamilyTree;
import vn.giapha.genealogy.api.TreeSettingsDTO;

@Component
public class TreeSettingsCodec {

    private final ObjectMapper objectMapper;

    public TreeSettingsCodec(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public TreeSettingsDTO read(FamilyTree tree) {
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
        return dto;
    }

    public void write(FamilyTree tree, TreeSettingsDTO dto) {
        String display = dto.getDisplayName() != null ? dto.getDisplayName().trim() : "";
        tree.setSurname(extractSurname(display, tree.getSurname()));
        tree.setBranchName(extractBranch(display, tree.getBranchName()));
        if (dto.getProvinceCode() != null) {
            String p = dto.getProvinceCode().trim();
            tree.setProvinceCode(p.isEmpty() ? null : p);
        }
        TreeSettingsDTO toStore = dto;
        toStore.setSlug(tree.getSlug());
        try {
            tree.setMetaJson(objectMapper.writeValueAsString(toStore));
        } catch (Exception e) {
            throw new IllegalStateException("Không ghi được cấu hình cây", e);
        }
    }

    private static String composeDisplayName(FamilyTree tree) {
        List<String> parts = new ArrayList<>();
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
