package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.CompteRenduRequest;
import sn.uchk.university.entity.responseDTO.CompteRenduResponse;
import sn.uchk.university.service.CompteRenduService;

import java.util.List;

@RestController
@RequestMapping("/api/comptes-rendus")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CompteRenduController {

    private final CompteRenduService compteRenduService;

    @PostMapping
    public CompteRenduResponse create(@RequestBody CompteRenduRequest request) {
        return compteRenduService.create(request);
    }

    @GetMapping
    public List<CompteRenduResponse> findAll() {
        return compteRenduService.findAll();
    }

    @GetMapping("/{id}")
    public CompteRenduResponse findById(@PathVariable Long id) {
        return compteRenduService.findById(id);
    }

    @GetMapping("/reunion/{reunionId}")
    public CompteRenduResponse findByReunion(@PathVariable Long reunionId) {
        return compteRenduService.findByReunion(reunionId);
    }

    @PutMapping("/{id}")
    public CompteRenduResponse update(
            @PathVariable Long id,
            @RequestBody CompteRenduRequest request
    ) {
        return compteRenduService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        compteRenduService.delete(id);
        return "Compte rendu supprimé avec succès";
    }
}