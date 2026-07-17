package vn.giapha.notification.internal;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import vn.giapha.notification.api.NotifyChannels;

class ReminderPlannerUnitTest {

    @Test
    void parseChannelsDefaultsToEmail() {
        assertThat(ReminderPlanner.parseChannels(null)).containsExactly(NotifyChannels.EMAIL);
        assertThat(ReminderPlanner.parseChannels("")).containsExactly(NotifyChannels.EMAIL);
    }

    @Test
    void parseChannelsNormalizesAliases() {
        List<String> ch = ReminderPlanner.parseChannels("email, zalo, push");
        assertThat(ch).containsExactly(NotifyChannels.EMAIL, NotifyChannels.ZALO, NotifyChannels.WEB_PUSH);
    }

    @Test
    void attachAndExtractNotifyEmail() {
        String raw = ReminderPlanner.attachNotifyEmail("email,zalo", "a@b.vn");
        assertThat(raw).isEqualTo("email:a@b.vn,zalo");
        assertThat(ReminderPlanner.extractNotifyEmail(raw)).isEqualTo("a@b.vn");
        assertThat(ReminderPlanner.parseChannels(raw)).containsExactly(NotifyChannels.EMAIL, NotifyChannels.ZALO);
    }
}
