package vn.giapha.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A DeathAnniversary.
 */
@Entity
@Table(name = "death_anniversary")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DeathAnniversary implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "lunar_day", nullable = false)
    private Integer lunarDay;

    @NotNull
    @Column(name = "lunar_month", nullable = false)
    private Integer lunarMonth;

    @Column(name = "leap_month")
    private Boolean leapMonth;

    @Column(name = "can_chi")
    private String canChi;

    @Column(name = "note")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private Person person;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DeathAnniversary id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getLunarDay() {
        return this.lunarDay;
    }

    public DeathAnniversary lunarDay(Integer lunarDay) {
        this.setLunarDay(lunarDay);
        return this;
    }

    public void setLunarDay(Integer lunarDay) {
        this.lunarDay = lunarDay;
    }

    public Integer getLunarMonth() {
        return this.lunarMonth;
    }

    public DeathAnniversary lunarMonth(Integer lunarMonth) {
        this.setLunarMonth(lunarMonth);
        return this;
    }

    public void setLunarMonth(Integer lunarMonth) {
        this.lunarMonth = lunarMonth;
    }

    public Boolean getLeapMonth() {
        return this.leapMonth;
    }

    public DeathAnniversary leapMonth(Boolean leapMonth) {
        this.setLeapMonth(leapMonth);
        return this;
    }

    public void setLeapMonth(Boolean leapMonth) {
        this.leapMonth = leapMonth;
    }

    public String getCanChi() {
        return this.canChi;
    }

    public DeathAnniversary canChi(String canChi) {
        this.setCanChi(canChi);
        return this;
    }

    public void setCanChi(String canChi) {
        this.canChi = canChi;
    }

    public String getNote() {
        return this.note;
    }

    public DeathAnniversary note(String note) {
        this.setNote(note);
        return this;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public DeathAnniversary tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    public Person getPerson() {
        return this.person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public DeathAnniversary person(Person person) {
        this.setPerson(person);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DeathAnniversary)) {
            return false;
        }
        return getId() != null && getId().equals(((DeathAnniversary) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DeathAnniversary{" +
            "id=" + getId() +
            ", lunarDay=" + getLunarDay() +
            ", lunarMonth=" + getLunarMonth() +
            ", leapMonth='" + getLeapMonth() + "'" +
            ", canChi='" + getCanChi() + "'" +
            ", note='" + getNote() + "'" +
            "}";
    }
}
