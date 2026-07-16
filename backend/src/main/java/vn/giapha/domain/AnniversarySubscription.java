package vn.giapha.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A AnniversarySubscription.
 */
@Entity
@Table(name = "anniversary_subscription")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AnniversarySubscription implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "days_before")
    private Integer daysBefore;

    @Column(name = "channels")
    private String channels;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private Person person;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AnniversarySubscription id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return this.userId;
    }

    public AnniversarySubscription userId(String userId) {
        this.setUserId(userId);
        return this;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getDaysBefore() {
        return this.daysBefore;
    }

    public AnniversarySubscription daysBefore(Integer daysBefore) {
        this.setDaysBefore(daysBefore);
        return this;
    }

    public void setDaysBefore(Integer daysBefore) {
        this.daysBefore = daysBefore;
    }

    public String getChannels() {
        return this.channels;
    }

    public AnniversarySubscription channels(String channels) {
        this.setChannels(channels);
        return this;
    }

    public void setChannels(String channels) {
        this.channels = channels;
    }

    public Person getPerson() {
        return this.person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public AnniversarySubscription person(Person person) {
        this.setPerson(person);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AnniversarySubscription)) {
            return false;
        }
        return getId() != null && getId().equals(((AnniversarySubscription) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AnniversarySubscription{" +
            "id=" + getId() +
            ", userId='" + getUserId() + "'" +
            ", daysBefore=" + getDaysBefore() +
            ", channels='" + getChannels() + "'" +
            "}";
    }
}
