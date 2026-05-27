package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.ModuleFormation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleFormationRepository extends JpaRepository<ModuleFormation, Long> {

    boolean existsByCodeModule(String codeModule);

    boolean existsByLibelleAndFormationId(String libelle, Long formationId);

    Optional<ModuleFormation> findByCodeModule(String codeModule);

    List<ModuleFormation> findByFormationId(Long formationId);
}