package sn.uchk.university.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uchk.university.entity.Document;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    boolean existsByCodeDocument(String codeDocument);

    Optional<Document> findByCodeDocument(String codeDocument);

    List<Document> findByTypeDocument(String typeDocument);

    List<Document> findByStatut(String statut);

    List<Document> findByCreatedById(Long createdById);
}