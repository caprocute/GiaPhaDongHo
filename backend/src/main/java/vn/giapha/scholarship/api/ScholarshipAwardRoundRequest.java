package vn.giapha.scholarship.api;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Trao học bổng hàng loạt + (tuỳ chọn) tạo lễ vinh danh. */
public class ScholarshipAwardRoundRequest {

    private List<Long> entryIds = new ArrayList<>();
    private BigDecimal defaultAwardAmount;
    private String reviewNote;
    private boolean createHonorEvent = true;
    private String honorEventTitle;
    private String honorEventLocation;

    public List<Long> getEntryIds() {
        return entryIds;
    }

    public void setEntryIds(List<Long> entryIds) {
        this.entryIds = entryIds != null ? entryIds : new ArrayList<>();
    }

    public BigDecimal getDefaultAwardAmount() {
        return defaultAwardAmount;
    }

    public void setDefaultAwardAmount(BigDecimal defaultAwardAmount) {
        this.defaultAwardAmount = defaultAwardAmount;
    }

    public String getReviewNote() {
        return reviewNote;
    }

    public void setReviewNote(String reviewNote) {
        this.reviewNote = reviewNote;
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
