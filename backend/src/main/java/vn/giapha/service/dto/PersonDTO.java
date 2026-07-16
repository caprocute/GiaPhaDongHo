package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.Person} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PersonDTO implements Serializable {

    private Long id;

    @NotNull
    private String code;

    @NotNull
    private String fullName;

    private String tenHuy;

    private String tenThuong;

    @NotNull
    private String gender;

    @NotNull
    private String lifeStatus;

    private Integer generation;

    private String lineagePath;

    private LocalDate birthSolar;

    @Lob
    private String birthLunarJson;

    private LocalDate deathSolar;

    @Lob
    private String deathLunarJson;

    @Lob
    private String graveInfo;

    private Double graveLat;

    private Double graveLng;

    @Lob
    private String biography;

    @Lob
    private String notes;

    private String privacy;

    private String linkedUserId;

    private Integer version;

    private FamilyTreeDTO tree;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTenHuy() {
        return tenHuy;
    }

    public void setTenHuy(String tenHuy) {
        this.tenHuy = tenHuy;
    }

    public String getTenThuong() {
        return tenThuong;
    }

    public void setTenThuong(String tenThuong) {
        this.tenThuong = tenThuong;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getLifeStatus() {
        return lifeStatus;
    }

    public void setLifeStatus(String lifeStatus) {
        this.lifeStatus = lifeStatus;
    }

    public Integer getGeneration() {
        return generation;
    }

    public void setGeneration(Integer generation) {
        this.generation = generation;
    }

    public String getLineagePath() {
        return lineagePath;
    }

    public void setLineagePath(String lineagePath) {
        this.lineagePath = lineagePath;
    }

    public LocalDate getBirthSolar() {
        return birthSolar;
    }

    public void setBirthSolar(LocalDate birthSolar) {
        this.birthSolar = birthSolar;
    }

    public String getBirthLunarJson() {
        return birthLunarJson;
    }

    public void setBirthLunarJson(String birthLunarJson) {
        this.birthLunarJson = birthLunarJson;
    }

    public LocalDate getDeathSolar() {
        return deathSolar;
    }

    public void setDeathSolar(LocalDate deathSolar) {
        this.deathSolar = deathSolar;
    }

    public String getDeathLunarJson() {
        return deathLunarJson;
    }

    public void setDeathLunarJson(String deathLunarJson) {
        this.deathLunarJson = deathLunarJson;
    }

    public String getGraveInfo() {
        return graveInfo;
    }

    public void setGraveInfo(String graveInfo) {
        this.graveInfo = graveInfo;
    }

    public Double getGraveLat() {
        return graveLat;
    }

    public void setGraveLat(Double graveLat) {
        this.graveLat = graveLat;
    }

    public Double getGraveLng() {
        return graveLng;
    }

    public void setGraveLng(Double graveLng) {
        this.graveLng = graveLng;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPrivacy() {
        return privacy;
    }

    public void setPrivacy(String privacy) {
        this.privacy = privacy;
    }

    public String getLinkedUserId() {
        return linkedUserId;
    }

    public void setLinkedUserId(String linkedUserId) {
        this.linkedUserId = linkedUserId;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
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
        if (!(o instanceof PersonDTO)) {
            return false;
        }

        PersonDTO personDTO = (PersonDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, personDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PersonDTO{" +
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
            ", tree=" + getTree() +
            "}";
    }
}
