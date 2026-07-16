package vn.giapha.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A EventRsvp.
 */
@Entity
@Table(name = "event_rsvp")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class EventRsvp implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "household_name", nullable = false)
    private String householdName;

    @Column(name = "headcount")
    private Integer headcount;

    @Column(name = "vehicles")
    private Integer vehicles;

    @Column(name = "assignment")
    private String assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private ClanEvent event;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public EventRsvp id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHouseholdName() {
        return this.householdName;
    }

    public EventRsvp householdName(String householdName) {
        this.setHouseholdName(householdName);
        return this;
    }

    public void setHouseholdName(String householdName) {
        this.householdName = householdName;
    }

    public Integer getHeadcount() {
        return this.headcount;
    }

    public EventRsvp headcount(Integer headcount) {
        this.setHeadcount(headcount);
        return this;
    }

    public void setHeadcount(Integer headcount) {
        this.headcount = headcount;
    }

    public Integer getVehicles() {
        return this.vehicles;
    }

    public EventRsvp vehicles(Integer vehicles) {
        this.setVehicles(vehicles);
        return this;
    }

    public void setVehicles(Integer vehicles) {
        this.vehicles = vehicles;
    }

    public String getAssignment() {
        return this.assignment;
    }

    public EventRsvp assignment(String assignment) {
        this.setAssignment(assignment);
        return this;
    }

    public void setAssignment(String assignment) {
        this.assignment = assignment;
    }

    public ClanEvent getEvent() {
        return this.event;
    }

    public void setEvent(ClanEvent clanEvent) {
        this.event = clanEvent;
    }

    public EventRsvp event(ClanEvent clanEvent) {
        this.setEvent(clanEvent);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EventRsvp)) {
            return false;
        }
        return getId() != null && getId().equals(((EventRsvp) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EventRsvp{" +
            "id=" + getId() +
            ", householdName='" + getHouseholdName() + "'" +
            ", headcount=" + getHeadcount() +
            ", vehicles=" + getVehicles() +
            ", assignment='" + getAssignment() + "'" +
            "}";
    }
}
