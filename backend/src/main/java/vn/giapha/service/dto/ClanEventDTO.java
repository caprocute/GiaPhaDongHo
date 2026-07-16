package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.ClanEvent} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ClanEventDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private Instant startSolar;

    @Lob
    private String lunarJson;

    private String location;

    @Lob
    private String checklistJson;

    private FamilyTreeDTO tree;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Instant getStartSolar() {
        return startSolar;
    }

    public void setStartSolar(Instant startSolar) {
        this.startSolar = startSolar;
    }

    public String getLunarJson() {
        return lunarJson;
    }

    public void setLunarJson(String lunarJson) {
        this.lunarJson = lunarJson;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getChecklistJson() {
        return checklistJson;
    }

    public void setChecklistJson(String checklistJson) {
        this.checklistJson = checklistJson;
    }

    public FamilyTreeDTO getTree() {
        return tree;
    }

    public void setTree(FamilyTreeDTO tree) {
        this.tree = tree;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClanEventDTO)) {
            return false;
        }

        ClanEventDTO clanEventDTO = (ClanEventDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, clanEventDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClanEventDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", startSolar='" + getStartSolar() + "'" +
            ", lunarJson='" + getLunarJson() + "'" +
            ", location='" + getLocation() + "'" +
            ", checklistJson='" + getChecklistJson() + "'" +
            ", tree=" + getTree() +
            "}";
    }
}
