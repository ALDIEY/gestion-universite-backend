package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.PartenaireRequest;
import sn.uchk.university.entity.responseDTO.PartenaireResponse;
import sn.uchk.university.service.PartenaireService;

import java.util.List;

@RestController
@RequestMapping("/api/partenaires")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PartenaireController {

    private final PartenaireService partenaireService;

    @PostMapping
    public PartenaireResponse create(@RequestBody PartenaireRequest request) {
        return partenaireService.create(request);
    }

    @GetMapping
    public List<PartenaireResponse> findAll() {
        return partenaireService.findAll();
    }

    @GetMapping("/{id}")
    public PartenaireResponse findById(@PathVariable Long id) {
        return partenaireService.findById(id);
    }

    @GetMapping("/domaine/{domaine}")
    public List<PartenaireResponse> findByDomaine(@PathVariable String domaine) {
        return partenaireService.findByDomaine(domaine);
    }

    @GetMapping("/type/{typePartenaire}")
    public List<PartenaireResponse> findByType(@PathVariable String typePartenaire) {
        return partenaireService.findByType(typePartenaire);
    }

    @GetMapping("/active")
    public List<PartenaireResponse> findActive() {
        return partenaireService.findActive();
    }

    @PutMapping("/{id}")
    public PartenaireResponse update(
            @PathVariable Long id,
            @RequestBody PartenaireRequest request
    ) {
        return partenaireService.update(id, request);
    }

    @PatchMapping("/{id}/activate")
    public PartenaireResponse activate(@PathVariable Long id) {
        return partenaireService.activate(id);
    }

    @PatchMapping("/{id}/deactivate")
    public PartenaireResponse deactivate(@PathVariable Long id) {
        return partenaireService.deactivate(id);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        partenaireService.delete(id);
        return "Partenaire supprimé avec succès";
    }
}