package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uchk.university.entity.Cours;

public interface CoursRepository extends JpaRepository<Cours, Long> {
}