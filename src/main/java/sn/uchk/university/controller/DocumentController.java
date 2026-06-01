package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.DocumentRequest;
import sn.uchk.university.entity.responseDTO.DocumentResponse;
import sn.uchk.university.service.DocumentService;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public DocumentResponse create(@RequestBody DocumentRequest request) {
        return documentService.create(request);
    }

    @GetMapping
    public List<DocumentResponse> findAll() {
        return documentService.findAll();
    }

    @GetMapping("/{id}")
    public DocumentResponse findById(@PathVariable Long id) {
        return documentService.findById(id);
    }

    @GetMapping("/code/{codeDocument}")
    public DocumentResponse findByCode(@PathVariable String codeDocument) {
        return documentService.findByCode(codeDocument);
    }

    @GetMapping("/type/{typeDocument}")
    public List<DocumentResponse> findByType(@PathVariable String typeDocument) {
        return documentService.findByType(typeDocument);
    }

    @GetMapping("/statut/{statut}")
    public List<DocumentResponse> findByStatut(@PathVariable String statut) {
        return documentService.findByStatut(statut);
    }

    @GetMapping("/created-by/{createdById}")
    public List<DocumentResponse> findByCreatedBy(@PathVariable Long createdById) {
        return documentService.findByCreatedBy(createdById);
    }

    @PutMapping("/{id}")
    public DocumentResponse update(
            @PathVariable Long id,
            @RequestBody DocumentRequest request
    ) {
        return documentService.update(id, request);
    }

    @PatchMapping("/{id}/publish")
    public DocumentResponse publish(@PathVariable Long id) {
        return documentService.publish(id);
    }

    @PatchMapping("/{id}/archive")
    public DocumentResponse archive(@PathVariable Long id) {
        return documentService.archive(id);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        documentService.delete(id);
        return "Document supprimé avec succès";
    }
}