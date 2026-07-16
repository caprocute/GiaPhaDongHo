package vn.giapha.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.AnniversarySubscription} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AnniversarySubscriptionDTO implements Serializable {

    private Long id;

    @NotNull
    private String userId;

    private Integer daysBefore;

    private String channels;

    private PersonDTO person;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getDaysBefore() {
        return daysBefore;
    }

    public void setDaysBefore(Integer daysBefore) {
        this.daysBefore = daysBefore;
    }

    public String getChannels() {
        return channels;
    }

    public void setChannels(String channels) {
        this.channels = channels;
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
        if (!(o instanceof AnniversarySubscriptionDTO)) {
            return false;
        }

        AnniversarySubscriptionDTO anniversarySubscriptionDTO = (AnniversarySubscriptionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, anniversarySubscriptionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AnniversarySubscriptionDTO{" +
            "id=" + getId() +
            ", userId='" + getUserId() + "'" +
            ", daysBefore=" + getDaysBefore() +
            ", channels='" + getChannels() + "'" +
            ", person=" + getPerson() +
            "}";
    }
}
