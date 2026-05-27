package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.Inscription;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    List<Inscription> findByEtudiantId(Long etudiantId);

    List<Inscription> findByFormationId(Long formationId);

    Optional<Inscription> findByEtudiantIdAndFormationIdAndAnneeAcademique(
            Long etudiantId,
            Long formationId,
            String anneeAcademique
    );

    boolean existsByEtudiantIdAndFormationIdAndAnneeAcademique(
            Long etudiantId,
            Long formationId,
            String anneeAcademique
    );
}