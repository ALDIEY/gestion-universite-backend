package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.StageRequest;
import sn.uchk.university.entity.responseDTO.StageResponse;
import sn.uchk.university.service.StageService;

import java.util.List;

@RestController
@RequestMapping("/api/stages")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StageController {

    private final StageService stageService;

    @PostMapping
    public StageResponse create(@RequestBody StageRequest request) {
        return stageService.create(request);
    }

    @GetMapping
    public List<StageResponse> findAll() {
        return stageService.findAll();
    }

    @GetMapping("/{id}")
    public StageResponse findById(@PathVariable Long id) {
        return stageService.findById(id);
    }

    @GetMapping("/etudiant/{etudiantId}")
    public List<StageResponse> findByEtudiant(@PathVariable Long etudiantId) {
        return stageService.findByEtudiant(etudiantId);
    }

    @GetMapping("/partenaire/{partenaireId}")
    public List<StageResponse> findByPartenaire(@PathVariable Long partenaireId) {
        return stageService.findByPartenaire(partenaireId);
    }

    @GetMapping("/statut/{statut}")
    public List<StageResponse> findByStatut(@PathVariable String statut) {
        return stageService.findByStatut(statut);
    }

    @PutMapping("/{id}")
    public StageResponse update(
            @PathVariable Long id,
            @RequestBody StageRequest request
    ) {
        return stageService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        stageService.delete(id);
        return "Stage supprimé avec succès";
    }
}