package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.InscriptionRequest;
import sn.uchk.university.entity.responseDTO.InscriptionResponse;
import sn.uchk.university.service.InscriptionService;

import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class InscriptionController {

    private final InscriptionService inscriptionService;

    @PostMapping
    public InscriptionResponse create(@RequestBody InscriptionRequest request) {
        return inscriptionService.create(request);
    }

    @GetMapping
    public List<InscriptionResponse> findAll() {
        return inscriptionService.findAll();
    }

    @GetMapping("/{id}")
    public InscriptionResponse findById(@PathVariable Long id) {
        return inscriptionService.findById(id);
    }

    @GetMapping("/etudiant/{etudiantId}")
    public List<InscriptionResponse> findByEtudiant(@PathVariable Long etudiantId) {
        return inscriptionService.findByEtudiant(etudiantId);
    }

    @GetMapping("/formation/{formationId}")
    public List<InscriptionResponse> findByFormation(@PathVariable Long formationId) {
        return inscriptionService.findByFormation(formationId);
    }

    @PutMapping("/{id}")
    public InscriptionResponse update(
            @PathVariable Long id,
            @RequestBody InscriptionRequest request
    ) {
        return inscriptionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        inscriptionService.delete(id);
        return "Inscription supprimée avec succès";
    }
}