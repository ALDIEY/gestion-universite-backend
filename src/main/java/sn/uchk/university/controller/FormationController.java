package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.FormationRequest;
import sn.uchk.university.entity.responseDTO.FormationResponse;

import sn.uchk.university.service.FormationService;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FormationController {

    private final FormationService formationService;

    @PostMapping
    public FormationResponse create(@RequestBody FormationRequest request) {
        return formationService.create(request);
    }

    @GetMapping
    public List<FormationResponse> findAll() {
        return formationService.findAll();
    }

    @GetMapping("/{id}")
    public FormationResponse findById(@PathVariable Long id) {
        return formationService.findById(id);
    }

    @GetMapping("/code/{codeFormation}")
    public FormationResponse findByCode(@PathVariable String codeFormation) {
        return formationService.findByCode(codeFormation);
    }

    @PutMapping("/{id}")
    public FormationResponse update(
            @PathVariable Long id,
            @RequestBody FormationRequest request
    ) {
        return formationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        formationService.delete(id);
        return "Formation supprimée avec succès";
    }
}