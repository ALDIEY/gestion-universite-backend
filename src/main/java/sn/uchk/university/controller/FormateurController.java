package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.FormateurRequest;
import sn.uchk.university.entity.responseDTO.FormateurResponse;
import sn.uchk.university.service.FormateurService;

import java.util.List;

@RestController
@RequestMapping("/api/formateurs")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FormateurController {

    private final FormateurService formateurService;

    @PostMapping
    public FormateurResponse create(@RequestBody FormateurRequest request) {
        return formateurService.create(request);
    }

    @GetMapping
    public List<FormateurResponse> findAll() {
        return formateurService.findAll();
    }

    @GetMapping("/{id}")
    public FormateurResponse findById(@PathVariable Long id) {
        return formateurService.findById(id);
    }

    @GetMapping("/code/{codeFormateur}")
    public FormateurResponse findByCode(@PathVariable String codeFormateur) {
        return formateurService.findByCode(codeFormateur);
    }

    @PutMapping("/{id}")
    public FormateurResponse update(
            @PathVariable Long id,
            @RequestBody FormateurRequest request
    ) {
        return formateurService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        formateurService.delete(id);
        return "Formateur supprimé avec succès";
    }
}