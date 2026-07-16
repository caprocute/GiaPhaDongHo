package vn.giapha.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * A Person.
 */
@Entity
@Table(name = "person")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Person implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "code", nullable = false)
    private String code;

    @NotNull
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "ten_huy")
    private String tenHuy;

    @Column(name = "ten_thuong")
    private String tenThuong;

    @NotNull
    @Column(name = "gender", nullable = false)
    private String gender;

    @NotNull
    @Column(name = "life_status", nullable = false)
    private String lifeStatus;

    @Column(name = "generation")
    private Integer generation;

    @Column(name = "lineage_path")
    private String lineagePath;

    @Column(name = "birth_solar")
    private LocalDate birthSolar;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "birth_lunar_json")
    private String birthLunarJson;

    @Column(name = "death_solar")
    private LocalDate deathSolar;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "death_lunar_json")
    private String deathLunarJson;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "grave_info")
    private String graveInfo;

    @Column(name = "grave_lat")
    private Double graveLat;

    @Column(name = "grave_lng")
    private Double graveLng;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "biography")
    private String biography;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "notes")
    private String notes;

    @Column(name = "privacy")
    private String privacy;

    @Column(name = "linked_user_id")
    private String linkedUserId;

    @Column(name = "version")
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Person id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public Person code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getFullName() {
        return this.fullName;
    }

    public Person fullName(String fullName) {
        this.setFullName(fullName);
        return this;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTenHuy() {
        return this.tenHuy;
    }

    public Person tenHuy(String tenHuy) {
        this.setTenHuy(tenHuy);
        return this;
    }

    public void setTenHuy(String tenHuy) {
        this.tenHuy = tenHuy;
    }

    public String getTenThuong() {
        return this.tenThuong;
    }

    public Person tenThuong(String tenThuong) {
        this.setTenThuong(tenThuong);
        return this;
    }

    public void setTenThuong(String tenThuong) {
        this.tenThuong = tenThuong;
    }

    public String getGender() {
        return this.gender;
    }

    public Person gender(String gender) {
        this.setGender(gender);
        return this;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getLifeStatus() {
        return this.lifeStatus;
    }

    public Person lifeStatus(String lifeStatus) {
        this.setLifeStatus(lifeStatus);
        return this;
    }

    public void setLifeStatus(String lifeStatus) {
        this.lifeStatus = lifeStatus;
    }

    public Integer getGeneration() {
        return this.generation;
    }

    public Person generation(Integer generation) {
        this.setGeneration(generation);
        return this;
    }

    public void setGeneration(Integer generation) {
        this.generation = generation;
    }

    public String getLineagePath() {
        return this.lineagePath;
    }

    public Person lineagePath(String lineagePath) {
        this.setLineagePath(lineagePath);
        return this;
    }

    public void setLineagePath(String lineagePath) {
        this.lineagePath = lineagePath;
    }

    public LocalDate getBirthSolar() {
        return this.birthSolar;
    }

    public Person birthSolar(LocalDate birthSolar) {
        this.setBirthSolar(birthSolar);
        return this;
    }

    public void setBirthSolar(LocalDate birthSolar) {
        this.birthSolar = birthSolar;
    }

    public String getBirthLunarJson() {
        return this.birthLunarJson;
    }

    public Person birthLunarJson(String birthLunarJson) {
        this.setBirthLunarJson(birthLunarJson);
        return this;
    }

    public void setBirthLunarJson(String birthLunarJson) {
        this.birthLunarJson = birthLunarJson;
    }

    public LocalDate getDeathSolar() {
        return this.deathSolar;
    }

    public Person deathSolar(LocalDate deathSolar) {
        this.setDeathSolar(deathSolar);
        return this;
    }

    public void setDeathSolar(LocalDate deathSolar) {
        this.deathSolar = deathSolar;
    }

    public String getDeathLunarJson() {
        return this.deathLunarJson;
    }

    public Person deathLunarJson(String deathLunarJson) {
        this.setDeathLunarJson(deathLunarJson);
        return this;
    }

    public void setDeathLunarJson(String deathLunarJson) {
        this.deathLunarJson = deathLunarJson;
    }

    public String getGraveInfo() {
        return this.graveInfo;
    }

    public Person graveInfo(String graveInfo) {
        this.setGraveInfo(graveInfo);
        return this;
    }

    public void setGraveInfo(String graveInfo) {
        this.graveInfo = graveInfo;
    }

    public Double getGraveLat() {
        return this.graveLat;
    }

    public Person graveLat(Double graveLat) {
        this.setGraveLat(graveLat);
        return this;
    }

    public void setGraveLat(Double graveLat) {
        this.graveLat = graveLat;
    }

    public Double getGraveLng() {
        return this.graveLng;
    }

    public Person graveLng(Double graveLng) {
        this.setGraveLng(graveLng);
        return this;
    }

    public void setGraveLng(Double graveLng) {
        this.graveLng = graveLng;
    }

    public String getBiography() {
        return this.biography;
    }

    public Person biography(String biography) {
        this.setBiography(biography);
        return this;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getNotes() {
        return this.notes;
    }

    public Person notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPrivacy() {
        return this.privacy;
    }

    public Person privacy(String privacy) {
        this.setPrivacy(privacy);
        return this;
    }

    public void setPrivacy(String privacy) {
        this.privacy = privacy;
    }

    public String getLinkedUserId() {
        return this.linkedUserId;
    }

    public Person linkedUserId(String linkedUserId) {
        this.setLinkedUserId(linkedUserId);
        return this;
    }

    public void setLinkedUserId(String linkedUserId) {
        this.linkedUserId = linkedUserId;
    }

    public Integer getVersion() {
        return this.version;
    }

    public Person version(Integer version) {
        this.setVersion(version);
        return this;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public Person tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Person)) {
            return false;
        }
        return getId() != null && getId().equals(((Person) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Person{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", fullName='" + getFullName() + "'" +
            ", tenHuy='" + getTenHuy() + "'" +
            ", tenThuong='" + getTenThuong() + "'" +
            ", gender='" + getGender() + "'" +
            ", lifeStatus='" + getLifeStatus() + "'" +
            ", generation=" + getGeneration() +
            ", lineagePath='" + getLineagePath() + "'" +
            ", birthSolar='" + getBirthSolar() + "'" +
            ", birthLunarJson='" + getBirthLunarJson() + "'" +
            ", deathSolar='" + getDeathSolar() + "'" +
            ", deathLunarJson='" + getDeathLunarJson() + "'" +
            ", graveInfo='" + getGraveInfo() + "'" +
            ", graveLat=" + getGraveLat() +
            ", graveLng=" + getGraveLng() +
            ", biography='" + getBiography() + "'" +
            ", notes='" + getNotes() + "'" +
            ", privacy='" + getPrivacy() + "'" +
            ", linkedUserId='" + getLinkedUserId() + "'" +
            ", version=" + getVersion() +
            "}";
    }
}
