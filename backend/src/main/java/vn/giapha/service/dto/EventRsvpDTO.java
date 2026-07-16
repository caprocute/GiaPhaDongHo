package vn.giapha.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.EventRsvp} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class EventRsvpDTO implements Serializable {

    private Long id;

    @NotNull
    private String householdName;

    private Integer headcount;

    private Integer vehicles;

    private String assignment;

    private ClanEventDTO event;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHouseholdName() {
        return householdName;
    }

    public void setHouseholdName(String householdName) {
        this.householdName = householdName;
    }

    public Integer getHeadcount() {
        return headcount;
    }

    public void setHeadcount(Integer headcount) {
        this.headcount = headcount;
    }

    public Integer getVehicles() {
        return vehicles;
    }

    public void setVehicles(Integer vehicles) {
        this.vehicles = vehicles;
    }

    public String getAssignment() {
        return assignment;
    }

    public void setAssignment(String assignment) {
        this.assignment = assignment;
    }

    public ClanEventDTO getEvent() {
        return event;
    }

    public void setEvent(ClanEventDTO event) {
        this.event = event;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EventRsvpDTO)) {
            return false;
        }

        EventRsvpDTO eventRsvpDTO = (EventRsvpDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, eventRsvpDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EventRsvpDTO{" +
            "id=" + getId() +
            ", householdName='" + getHouseholdName() + "'" +
            ", headcount=" + getHeadcount() +
            ", vehicles=" + getVehicles() +
            ", assignment='" + getAssignment() + "'" +
            ", event=" + getEvent() +
            "}";
    }
}
