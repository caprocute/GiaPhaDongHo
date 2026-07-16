package vn.giapha.search.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.genealogy.events.PersonUpdated;

/**
 * Reindex Person khi genealogy phát {@link PersonUpdated}.
 */
@Component
public class PersonUpdatedListener {

    private static final Logger LOG = LoggerFactory.getLogger(PersonUpdatedListener.class);

    private final PersonIndexer personIndexer;

    public PersonUpdatedListener(PersonIndexer personIndexer) {
        this.personIndexer = personIndexer;
    }

    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onPersonUpdated(PersonUpdated event) {
        LOG.debug("Reindex person {} ({})", event.personId(), event.code());
        personIndexer.reindex(event.personId());
    }
}
