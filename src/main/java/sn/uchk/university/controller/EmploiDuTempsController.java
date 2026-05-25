package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.EmploiDuTempsRequest;
import sn.uchk.university.entity.responseDTO.EmploiDuTempsResponse;
import sn.uchk.university.service.EmploiDuTempsService;

import java.util.List;

@RestController
@RequestMapping("/api/emplois-du-temps")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EmploiDuTempsController {

    private final EmploiDuTempsService emploiDuTempsService;

    @PostMapping
    public EmploiDuTempsResponse create(@RequestBody EmploiDuTempsRequest request) {
        return emploiDuTempsService.create(request);
    }

    @GetMapping
    public List<EmploiDuTempsResponse> findAll() {
        return emploiDuTempsService.findAll();
    }

    @GetMapping("/{id}")
    public EmploiDuTempsResponse findById(@PathVariable Long id) {
        return emploiDuTempsService.findById(id);
    }

    @GetMapping("/formation/{formationId}")
    public List<EmploiDuTempsResponse> findByFormation(@PathVariable Long formationId) {
        return emploiDuTempsService.findByFormation(formationId);
    }

    @GetMapping("/jour/{jour}")
    public List<EmploiDuTempsResponse> findByJour(@PathVariable String jour) {
        return emploiDuTempsService.findByJour(jour);
    }

    @PutMapping("/{id}")
    public EmploiDuTempsResponse update(
            @PathVariable Long id,
            @RequestBody EmploiDuTempsRequest request
    ) {
        return emploiDuTempsService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        emploiDuTempsService.delete(id);
        return "Emploi du temps supprimé avec succès";
    }
}