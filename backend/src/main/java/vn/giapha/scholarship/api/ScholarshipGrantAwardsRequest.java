package vn.giapha.scholarship.api;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Trao suất học bổng trong một đợt đang mở (SRS-12c). */
public class ScholarshipGrantAwardsRequest {

    private List<Long> entryIds = new ArrayList<>();
    private BigDecimal amount;
    private String note;
    private boolean createHonorEvent;
    private String honorEventTitle;
    private String honorEventLocation;

    public List<Long> getEntryIds() {
        return entryIds;
    }

    public void setEntryIds(List<Long> entryIds) {
        this.entryIds = entryIds != null ? entryIds : new ArrayList<>();
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public boolean isCreateHonorEvent() {
        return createHonorEvent;
    }

    public void setCreateHonorEvent(boolean createHonorEvent) {
        this.createHonorEvent = createHonorEvent;
    }

    public String getHonorEventTitle() {
        return honorEventTitle;
    }

    public void setHonorEventTitle(String honorEventTitle) {
        this.honorEventTitle = honorEventTitle;
    }

    public String getHonorEventLocation() {
        return honorEventLocation;
    }

    public void setHonorEventLocation(String honorEventLocation) {
        this.honorEventLocation = honorEventLocation;
    }
}
