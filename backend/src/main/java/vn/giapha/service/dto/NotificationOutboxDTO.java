package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.NotificationOutbox} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class NotificationOutboxDTO implements Serializable {

    private Long id;

    @NotNull
    private String channel;

    @Lob
    private String payloadJson;

    private String status;

    private Instant createdAt;

    private Instant sentAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof NotificationOutboxDTO)) {
            return false;
        }

        NotificationOutboxDTO notificationOutboxDTO = (NotificationOutboxDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, notificationOutboxDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NotificationOutboxDTO{" +
            "id=" + getId() +
            ", channel='" + getChannel() + "'" +
            ", payloadJson='" + getPayloadJson() + "'" +
            ", status='" + getStatus() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", sentAt='" + getSentAt() + "'" +
            "}";
    }
}
