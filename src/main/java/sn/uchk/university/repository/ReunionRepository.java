package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.Reunion;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReunionRepository extends JpaRepository<Reunion, Long> {

    List<Reunion> findByTypeReunion(String typeReunion);

    List<Reunion> findByStatut(String statut);

    List<Reunion> findByDateReunion(LocalDate dateReunion);
}