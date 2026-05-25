package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.Formation;

import java.util.Optional;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {

    boolean existsByIntitule(String intitule);

    boolean existsByCodeFormation(String codeFormation);

    Optional<Formation> findByCodeFormation(String codeFormation);
}