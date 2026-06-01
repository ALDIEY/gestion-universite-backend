package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uchk.university.entity.Stage;

import java.util.List;

public interface StageRepository extends JpaRepository<Stage, Long> {

    boolean existsByCodeStage(String codeStage);

    List<Stage> findByEtudiantId(Long etudiantId);

    List<Stage> findByPartenaireId(Long partenaireId);

    List<Stage> findByStatut(String statut);
}