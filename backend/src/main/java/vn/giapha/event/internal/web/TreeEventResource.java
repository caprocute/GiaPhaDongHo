package vn.giapha.event.internal.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.event.internal.EventService;
import vn.giapha.service.dto.ClanEventDTO;
import vn.giapha.service.dto.EventRsvpDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * Sự kiện dòng họ theo cây — F6 / R2.3.
 */
@RestController
@RequestMapping("/api/v1/trees/{slug}")
public class TreeEventResource {

    private static final Logger LOG = LoggerFactory.getLogger(TreeEventResource.class);

    private final EventService eventService;

    public TreeEventResource(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/events")
    public List<Map<String, Object>> list(@PathVariable String slug) {
        LOG.debug("GET events tree={}", slug);
        return eventService.listEvents(slug);
    }

    @GetMapping("/events/{id}")
    public Map<String, Object> get(@PathVariable String slug, @PathVariable Long id) {
        try {
            return eventService.getEvent(slug, id);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "clanEvent", "notfound");
        }
    }

    @PostMapping("/events")
    @RequiresPermission("event:clan:write")
    public ClanEventDTO create(@PathVariable String slug, @Valid @RequestBody ClanEventDTO body) {
        body.setId(null);
        try {
            return eventService.upsertEvent(slug, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "clanEvent", "invalid");
        }
    }

    @PutMapping("/events/{id}")
    @RequiresPermission("event:clan:write")
    public ClanEventDTO update(@PathVariable String slug, @PathVariable Long id, @Valid @RequestBody ClanEventDTO body) {
        body.setId(id);
        try {
            return eventService.upsertEvent(slug, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "clanEvent", "invalid");
        }
    }

    @GetMapping("/events/{id}/rsvps")
    @RequiresPermission("event:rsvp:read")
    public List<EventRsvpDTO> listRsvps(@PathVariable String slug, @PathVariable Long id) {
        try {
            return eventService.listRsvps(slug, id);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "eventRsvp", "invalid");
        }
    }

    @GetMapping("/events/{id}/stats")
    public Map<String, Object> stats(@PathVariable String slug, @PathVariable Long id) {
        try {
            return eventService.stats(slug, id);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "clanEvent", "invalid");
        }
    }

    @PostMapping("/events/{id}/rsvps")
    @RequiresPermission("event:rsvp:write")
    public EventRsvpDTO rsvp(@PathVariable String slug, @PathVariable Long id, @Valid @RequestBody EventRsvpDTO body) {
        try {
            return eventService.submitRsvp(slug, id, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "eventRsvp", "invalid");
        }
    }

    @PutMapping("/event-rsvps/{id}/assignment")
    @RequiresPermission("event:clan:write")
    public EventRsvpDTO assign(
        @PathVariable String slug,
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        try {
            return eventService.assign(slug, id, body != null ? body.get("assignment") : null);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "eventRsvp", "invalid");
        }
    }
}
