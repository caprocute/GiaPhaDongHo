package vn.giapha.event.events;

/** RSVP theo hộ đã ghi nhận (F6). */
public record RsvpSubmitted(Long rsvpId, Long eventId, String householdName, int headcount) {}
