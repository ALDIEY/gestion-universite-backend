package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.CompteRendu;

import java.util.Optional;

@Repository
public interface CompteRenduRepository extends JpaRepository<CompteRendu, Long> {

    Optional<CompteRendu> findByReunionId(Long reunionId);

    boolean existsByReunionId(Long reunionId);
}