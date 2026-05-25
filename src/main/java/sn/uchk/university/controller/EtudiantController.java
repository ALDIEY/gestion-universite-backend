package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.EtudiantRequest;
import sn.uchk.university.entity.responseDTO.EtudiantResponse;
import sn.uchk.university.service.EtudiantService;

import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EtudiantController {

    private final EtudiantService etudiantService;

    @PostMapping
    public EtudiantResponse create(@RequestBody EtudiantRequest request) {
        return etudiantService.create(request);
    }

    @GetMapping
    public List<EtudiantResponse> findAll() {
        return etudiantService.findAll();
    }

    @GetMapping("/{id}")
    public EtudiantResponse findById(@PathVariable Long id) {
        return etudiantService.findById(id);
    }

    @GetMapping("/ine/{ine}")
    public EtudiantResponse findByIne(@PathVariable String ine) {
        return etudiantService.findByIne(ine);
    }

    @PutMapping("/{id}")
    public EtudiantResponse update(
            @PathVariable Long id,
            @RequestBody EtudiantRequest request
    ) {
        return etudiantService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        etudiantService.delete(id);
        return "Étudiant supprimé avec succès";
    }
}