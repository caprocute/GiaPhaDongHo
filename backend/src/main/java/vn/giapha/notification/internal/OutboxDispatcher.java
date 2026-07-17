package vn.giapha.notification.internal;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.notification.api.NotifyChannels;
import vn.giapha.notification.internal.adapter.ChannelSender;
import vn.giapha.repository.NotificationOutboxRepository;

@Service
public class OutboxDispatcher {

    private static final Logger LOG = LoggerFactory.getLogger(OutboxDispatcher.class);

    private final NotificationOutboxRepository outboxRepository;
    private final Map<String, ChannelSender> senders;

    public OutboxDispatcher(NotificationOutboxRepository outboxRepository, List<ChannelSender> senders) {
        this.outboxRepository = outboxRepository;
        this.senders = senders.stream().collect(Collectors.toMap(ChannelSender::channel, Function.identity(), (a, b) -> a));
    }

    @Transactional
    public int dispatchPending(int limit) {
        List<NotificationOutbox> pending = outboxRepository.findTop50ByStatusOrderByCreatedAtAsc(NotifyChannels.STATUS_PENDING);
        int n = 0;
        for (NotificationOutbox msg : pending) {
            if (n >= limit) {
                break;
            }
            ChannelSender sender = senders.get(msg.getChannel() == null ? "" : msg.getChannel().toLowerCase());
            if (sender == null) {
                LOG.warn("Không có adapter cho channel={}", msg.getChannel());
                msg.setStatus(NotifyChannels.STATUS_FAILED);
                msg.setSentAt(Instant.now());
                outboxRepository.save(msg);
                n++;
                continue;
            }
            String status = sender.send(msg);
            msg.setStatus(status);
            msg.setSentAt(Instant.now());
            outboxRepository.save(msg);
            n++;
        }
        return n;
    }
}
