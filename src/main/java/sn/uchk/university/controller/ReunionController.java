package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.ReunionRequest;
import sn.uchk.university.entity.responseDTO.ReunionResponse;
import sn.uchk.university.service.ReunionService;

import java.util.List;

@RestController
@RequestMapping("/api/reunions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ReunionController {

    private final ReunionService reunionService;

    @PostMapping
    public ReunionResponse create(@RequestBody ReunionRequest request) {
        return reunionService.create(request);
    }

    @GetMapping
    public List<ReunionResponse> findAll() {
        return reunionService.findAll();
    }

    @GetMapping("/{id}")
    public ReunionResponse findById(@PathVariable Long id) {
        return reunionService.findById(id);
    }

    @GetMapping("/type/{typeReunion}")
    public List<ReunionResponse> findByType(@PathVariable String typeReunion) {
        return reunionService.findByType(typeReunion);
    }

    @GetMapping("/statut/{statut}")
    public List<ReunionResponse> findByStatut(@PathVariable String statut) {
        return reunionService.findByStatut(statut);
    }

    @GetMapping("/date/{date}")
    public List<ReunionResponse> findByDate(@PathVariable String date) {
        return reunionService.findByDate(date);
    }

    @PutMapping("/{id}")
    public ReunionResponse update(
            @PathVariable Long id,
            @RequestBody ReunionRequest request
    ) {
        return reunionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        reunionService.delete(id);
        return "Réunion supprimée avec succès";
    }
}