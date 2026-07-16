package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.ClanEventTestSamples.*;
import static vn.giapha.domain.EventRsvpTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class EventRsvpTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(EventRsvp.class);
        EventRsvp eventRsvp1 = getEventRsvpSample1();
        EventRsvp eventRsvp2 = new EventRsvp();
        assertThat(eventRsvp1).isNotEqualTo(eventRsvp2);

        eventRsvp2.setId(eventRsvp1.getId());
        assertThat(eventRsvp1).isEqualTo(eventRsvp2);

        eventRsvp2 = getEventRsvpSample2();
        assertThat(eventRsvp1).isNotEqualTo(eventRsvp2);
    }

    @Test
    void eventTest() {
        EventRsvp eventRsvp = getEventRsvpRandomSampleGenerator();
        ClanEvent clanEventBack = getClanEventRandomSampleGenerator();

        eventRsvp.setEvent(clanEventBack);
        assertThat(eventRsvp.getEvent()).isEqualTo(clanEventBack);

        eventRsvp.event(null);
        assertThat(eventRsvp.getEvent()).isNull();
    }
}
