package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.Cours;

import java.util.List;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {

    List<Cours> findByModuleId(Long moduleId);

    List<Cours> findByFormateurId(Long formateurId);
}