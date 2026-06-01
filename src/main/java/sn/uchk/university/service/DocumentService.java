package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.common.utils.DocumentCodeGenerator;
import sn.uchk.university.entity.Document;
import sn.uchk.university.entity.requestDTO.DocumentRequest;
import sn.uchk.university.entity.responseDTO.DocumentResponse;
import sn.uchk.university.repository.DocumentRepository;
import sn.uchk.university.user.entity.User;
import sn.uchk.university.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentCodeGenerator documentCodeGenerator;

    public DocumentResponse create(DocumentRequest request) {

        User createdBy = null;

        if (request.getCreatedById() != null) {
            createdBy = userRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new RuntimeException("Utilisateur créateur introuvable"));
        }

        String codeDocument = generateUniqueCode();

        Document document = Document.builder()
                .codeDocument(codeDocument)
                .titre(request.getTitre())
                .typeDocument(request.getTypeDocument())
                .statut(request.getStatut() != null ? request.getStatut() : "BROUILLON")
                .fichierUrl(request.getFichierUrl())
                .description(request.getDescription())
                .createdBy(createdBy)
                .build();

        return mapToResponse(documentRepository.save(document));
    }

    public List<DocumentResponse> findAll() {
        return documentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DocumentResponse findById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        return mapToResponse(document);
    }

    public DocumentResponse findByCode(String codeDocument) {
        Document document = documentRepository.findByCodeDocument(codeDocument)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        return mapToResponse(document);
    }

    public List<DocumentResponse> findByType(String typeDocument) {
        return documentRepository.findByTypeDocument(typeDocument)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DocumentResponse> findByStatut(String statut) {
        return documentRepository.findByStatut(statut)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DocumentResponse> findByCreatedBy(Long createdById) {
        return documentRepository.findByCreatedById(createdById)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DocumentResponse update(Long id, DocumentRequest request) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        User createdBy = null;

        if (request.getCreatedById() != null) {
            createdBy = userRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new RuntimeException("Utilisateur créateur introuvable"));
        }

        document.setTitre(request.getTitre());
        document.setTypeDocument(request.getTypeDocument());
        document.setStatut(request.getStatut());
        document.setFichierUrl(request.getFichierUrl());
        document.setDescription(request.getDescription());
        document.setCreatedBy(createdBy);

        return mapToResponse(documentRepository.save(document));
    }

    public DocumentResponse publish(Long id) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        document.setStatut("PUBLIE");

        return mapToResponse(documentRepository.save(document));
    }

    public DocumentResponse archive(Long id) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        document.setStatut("ARCHIVE");

        return mapToResponse(documentRepository.save(document));
    }

    public void delete(Long id) {
        if (!documentRepository.existsById(id)) {
            throw new RuntimeException("Document introuvable");
        }

        documentRepository.deleteById(id);
    }

    private String generateUniqueCode() {
        String code = documentCodeGenerator.generate();

        while (documentRepository.existsByCodeDocument(code)) {
            code = documentCodeGenerator.generate();
        }

        return code;
    }

    private DocumentResponse mapToResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .codeDocument(document.getCodeDocument())
                .titre(document.getTitre())
                .typeDocument(document.getTypeDocument())
                .statut(document.getStatut())
                .fichierUrl(document.getFichierUrl())
                .description(document.getDescription())

                .createdById(document.getCreatedBy() != null ? document.getCreatedBy().getId() : null)
                .createdByNom(document.getCreatedBy() != null ? document.getCreatedBy().getNom() : null)
                .createdByPrenom(document.getCreatedBy() != null ? document.getCreatedBy().getPrenom() : null)
                .createdByEmail(document.getCreatedBy() != null ? document.getCreatedBy().getEmail() : null)

                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}