package vn.giapha.core.lunar;

/**
 * Ngày âm lịch Việt Nam (có cờ tháng nhuận).
 */
public record LunarDate(int day, int month, int year, boolean leap) {}
