package vn.giapha.system.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuleRegistryRepository extends JpaRepository<ModuleRegistry, String> {}
