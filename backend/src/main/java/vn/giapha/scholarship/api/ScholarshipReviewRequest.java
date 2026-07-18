package vn.giapha.scholarship.api;

import java.math.BigDecimal;

/** Body duyệt / từ chối đề cử khuyến học. */
public class ScholarshipReviewRequest {

    private String reviewNote;
    private BigDecimal awardAmount;

    public String getReviewNote() {
        return reviewNote;
    }

    public void setReviewNote(String reviewNote) {
        this.reviewNote = reviewNote;
    }

    public BigDecimal getAwardAmount() {
        return awardAmount;
    }

    public void setAwardAmount(BigDecimal awardAmount) {
        this.awardAmount = awardAmount;
    }
}
