package vn.giapha.genealogy.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.genealogy.events.DeathAnniversaryUpserted;
import vn.giapha.repository.DeathAnniversaryRepository;

@ExtendWith(MockitoExtension.class)
class DeathAnniversarySyncServiceUnitTest {

    @Mock
    private DeathAnniversaryRepository repository;

    @Mock
    private ApplicationEventPublisher events;

    private DeathAnniversarySyncService service;

    @BeforeEach
    void setUp() {
        service = new DeathAnniversarySyncService(repository, events, new ObjectMapper());
    }

    @Test
    void aliveRemovesAnniversary() {
        Person person = person(1L, "alive", null, null);
        DeathAnniversary existing = new DeathAnniversary();
        existing.setId(9L);
        when(repository.findByPerson_Id(1L)).thenReturn(Optional.of(existing));

        service.syncFromPerson(person);

        verify(repository).delete(existing);
        verify(repository, never()).save(any());
    }

    @Test
    void deceasedWithLunarJsonUpserts() {
        Person person = person(
            2L,
            "deceased",
            null,
            "{\"day\":15,\"month\":7,\"year\":1990,\"leap\":false}"
        );
        when(repository.findByPerson_Id(2L)).thenReturn(Optional.empty());
        when(repository.save(any(DeathAnniversary.class))).thenAnswer(inv -> {
            DeathAnniversary a = inv.getArgument(0);
            a.setId(42L);
            return a;
        });

        service.syncFromPerson(person);

        ArgumentCaptor<DeathAnniversary> cap = ArgumentCaptor.forClass(DeathAnniversary.class);
        verify(repository).save(cap.capture());
        assertThat(cap.getValue().getLunarDay()).isEqualTo(15);
        assertThat(cap.getValue().getLunarMonth()).isEqualTo(7);
        assertThat(cap.getValue().getLeapMonth()).isFalse();
        verify(events).publishEvent(any(DeathAnniversaryUpserted.class));
    }

    @Test
    void deceasedWithSolarFallback() {
        Person person = person(3L, "deceased", LocalDate.of(2024, 2, 10), null);
        when(repository.findByPerson_Id(3L)).thenReturn(Optional.empty());
        when(repository.save(any(DeathAnniversary.class))).thenAnswer(inv -> {
            DeathAnniversary a = inv.getArgument(0);
            a.setId(43L);
            return a;
        });

        service.syncFromPerson(person);

        ArgumentCaptor<DeathAnniversary> cap = ArgumentCaptor.forClass(DeathAnniversary.class);
        verify(repository).save(cap.capture());
        assertThat(cap.getValue().getLunarDay()).isPositive();
        assertThat(cap.getValue().getLunarMonth()).isBetween(1, 12);
    }

    @Test
    void invalidLunarJsonSkipped() {
        Person person = person(4L, "deceased", null, "AAAAAAAAAA");
        service.syncFromPerson(person);
        verify(repository, never()).save(any());
        verify(repository, never()).delete(any());
    }

    @Test
    void parseLunarJson() {
        assertThat(service.parseLunarJson("{\"day\":1,\"month\":1,\"year\":2024,\"leap\":false}"))
            .isPresent()
            .get()
            .satisfies(d -> {
                assertThat(d.day()).isEqualTo(1);
                assertThat(d.month()).isEqualTo(1);
                assertThat(d.leap()).isFalse();
            });
        assertThat(service.parseLunarJson("not-json")).isEmpty();
    }

    private static Person person(Long id, String lifeStatus, LocalDate deathSolar, String deathLunarJson) {
        FamilyTree tree = new FamilyTree();
        tree.setId(10L);
        tree.setSlug("ho-hoang");
        Person p = new Person();
        p.setId(id);
        p.setLifeStatus(lifeStatus);
        p.setDeathSolar(deathSolar);
        p.setDeathLunarJson(deathLunarJson);
        p.setTree(tree);
        return p;
    }
}
