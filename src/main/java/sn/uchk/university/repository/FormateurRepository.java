package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uchk.university.entity.Formateur;

public interface FormateurRepository extends JpaRepository<Formateur, Long> {
}