package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.EmploiDuTemps;

import java.util.List;

@Repository
public interface EmploiDuTempsRepository extends JpaRepository<EmploiDuTemps, Long> {

    List<EmploiDuTemps> findByFormationId(Long formationId);

    List<EmploiDuTemps> findByJour(String jour);
}