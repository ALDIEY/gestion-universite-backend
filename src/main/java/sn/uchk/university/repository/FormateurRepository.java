package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.Formateur;

import java.util.Optional;

@Repository
public interface FormateurRepository extends JpaRepository<Formateur, Long> {

    boolean existsByCodeFormateur(String codeFormateur);

    Optional<Formateur> findByCodeFormateur(String codeFormateur);
}