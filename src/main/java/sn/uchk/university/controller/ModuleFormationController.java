package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.ModuleFormationRequest;
import sn.uchk.university.entity.responseDTO.ModuleFormationResponse;
import sn.uchk.university.service.ModuleFormationService;

import java.util.List;

@RestController
@RequestMapping("/api/modules-formation")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ModuleFormationController {

    private final ModuleFormationService moduleFormationService;

    @PostMapping
    public ModuleFormationResponse create(@RequestBody ModuleFormationRequest request) {
        return moduleFormationService.create(request);
    }

    @GetMapping
    public List<ModuleFormationResponse> findAll() {
        return moduleFormationService.findAll();
    }

    @GetMapping("/{id}")
    public ModuleFormationResponse findById(@PathVariable Long id) {
        return moduleFormationService.findById(id);
    }

    @GetMapping("/code/{codeModule}")
    public ModuleFormationResponse findByCode(@PathVariable String codeModule) {
        return moduleFormationService.findByCode(codeModule);
    }

    @GetMapping("/formation/{formationId}")
    public List<ModuleFormationResponse> findByFormation(@PathVariable Long formationId) {
        return moduleFormationService.findByFormation(formationId);
    }

    @PutMapping("/{id}")
    public ModuleFormationResponse update(
            @PathVariable Long id,
            @RequestBody ModuleFormationRequest request
    ) {
        return moduleFormationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        moduleFormationService.delete(id);
        return "Module supprimé avec succès";
    }
}