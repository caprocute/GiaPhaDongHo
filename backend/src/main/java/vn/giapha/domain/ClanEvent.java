package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * A ClanEvent.
 */
@Entity
@Table(name = "clan_event")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ClanEvent implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "start_solar")
    private Instant startSolar;

    /** Postgres text — không dùng @Lob (OID) kẻo JDBC đọc nhầm kiểu long. */
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "lunar_json")
    private String lunarJson;

    @Column(name = "location")
    private String location;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "checklist_json")
    private String checklistJson;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ClanEvent id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public ClanEvent title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Instant getStartSolar() {
        return this.startSolar;
    }

    public ClanEvent startSolar(Instant startSolar) {
        this.setStartSolar(startSolar);
        return this;
    }

    public void setStartSolar(Instant startSolar) {
        this.startSolar = startSolar;
    }

    public String getLunarJson() {
        return this.lunarJson;
    }

    public ClanEvent lunarJson(String lunarJson) {
        this.setLunarJson(lunarJson);
        return this;
    }

    public void setLunarJson(String lunarJson) {
        this.lunarJson = lunarJson;
    }

    public String getLocation() {
        return this.location;
    }

    public ClanEvent location(String location) {
        this.setLocation(location);
        return this;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getChecklistJson() {
        return this.checklistJson;
    }

    public ClanEvent checklistJson(String checklistJson) {
        this.setChecklistJson(checklistJson);
        return this;
    }

    public void setChecklistJson(String checklistJson) {
        this.checklistJson = checklistJson;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public ClanEvent tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClanEvent)) {
            return false;
        }
        return getId() != null && getId().equals(((ClanEvent) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClanEvent{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", startSolar='" + getStartSolar() + "'" +
            ", lunarJson='" + getLunarJson() + "'" +
            ", location='" + getLocation() + "'" +
            ", checklistJson='" + getChecklistJson() + "'" +
            "}";
    }
}
