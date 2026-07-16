package vn.giapha.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.DeathAnniversary} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DeathAnniversaryDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer lunarDay;

    @NotNull
    private Integer lunarMonth;

    private Boolean leapMonth;

    private String canChi;

    private String note;

    private FamilyTreeDTO tree;

    private PersonDTO person;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getLunarDay() {
        return lunarDay;
    }

    public void setLunarDay(Integer lunarDay) {
        this.lunarDay = lunarDay;
    }

    public Integer getLunarMonth() {
        return lunarMonth;
    }

    public void setLunarMonth(Integer lunarMonth) {
        this.lunarMonth = lunarMonth;
    }

    public Boolean getLeapMonth() {
        return leapMonth;
    }

    public void setLeapMonth(Boolean leapMonth) {
        this.leapMonth = leapMonth;
    }

    public String getCanChi() {
        return canChi;
    }

    public void setCanChi(String canChi) {
        this.canChi = canChi;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public FamilyTreeDTO getTree() {
        return tree;
    }

    public void setTree(FamilyTreeDTO tree) {
        this.tree = tree;
    }

    public PersonDTO getPerson() {
        return person;
    }

    public void setPerson(PersonDTO person) {
        this.person = person;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DeathAnniversaryDTO)) {
            return false;
        }

        DeathAnniversaryDTO deathAnniversaryDTO = (DeathAnniversaryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, deathAnniversaryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DeathAnniversaryDTO{" +
            "id=" + getId() +
            ", lunarDay=" + getLunarDay() +
            ", lunarMonth=" + getLunarMonth() +
            ", leapMonth='" + getLeapMonth() + "'" +
            ", canChi='" + getCanChi() + "'" +
            ", note='" + getNote() + "'" +
            ", tree=" + getTree() +
            ", person=" + getPerson() +
            "}";
    }
}
