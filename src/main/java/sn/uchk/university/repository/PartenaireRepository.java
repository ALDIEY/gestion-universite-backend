package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.Partenaire;

import java.util.List;

@Repository
public interface PartenaireRepository extends JpaRepository<Partenaire, Long> {

    boolean existsByNom(String nom);

    List<Partenaire> findByDomaine(String domaine);

    List<Partenaire> findByTypePartenaire(String typePartenaire);

    List<Partenaire> findByActifTrue();
}