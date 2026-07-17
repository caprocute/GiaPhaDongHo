package vn.giapha.donation.events;

import java.math.BigDecimal;

/** Đóng góp đã ghi nhận / đối soát (F4). */
public record ContributionReceived(Long contributionId, Long campaignId, String donorName, BigDecimal amount, String kind) {}
