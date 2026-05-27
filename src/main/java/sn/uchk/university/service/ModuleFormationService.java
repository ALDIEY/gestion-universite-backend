package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.common.utils.ModuleCodeGenerator;
import sn.uchk.university.entity.Formation;
import sn.uchk.university.entity.ModuleFormation;
import sn.uchk.university.entity.requestDTO.ModuleFormationRequest;
import sn.uchk.university.entity.responseDTO.ModuleFormationResponse;
import sn.uchk.university.repository.FormationRepository;
import sn.uchk.university.repository.ModuleFormationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleFormationService {

    private final ModuleFormationRepository moduleFormationRepository;
    private final FormationRepository formationRepository;
    private final ModuleCodeGenerator moduleCodeGenerator;

    public ModuleFormationResponse create(ModuleFormationRequest request) {

        Formation formation = formationRepository.findById(request.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        if (moduleFormationRepository.existsByLibelleAndFormationId(request.getLibelle(), request.getFormationId())) {
            throw new RuntimeException("Ce module existe déjà dans cette formation");
        }

        String codeModule = generateUniqueCode();

        ModuleFormation module = ModuleFormation.builder()
                .codeModule(codeModule)
                .libelle(request.getLibelle())
                .coefficient(request.getCoefficient() != null ? request.getCoefficient() : 1)
                .volumeHoraire(request.getVolumeHoraire() != null ? request.getVolumeHoraire() : 0)
                .semestre(request.getSemestre())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .formation(formation)
                .build();

        return mapToResponse(moduleFormationRepository.save(module));
    }

    public List<ModuleFormationResponse> findAll() {
        return moduleFormationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ModuleFormationResponse findById(Long id) {
        ModuleFormation module = moduleFormationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module introuvable"));

        return mapToResponse(module);
    }

    public ModuleFormationResponse findByCode(String codeModule) {
        ModuleFormation module = moduleFormationRepository.findByCodeModule(codeModule)
                .orElseThrow(() -> new RuntimeException("Module introuvable"));

        return mapToResponse(module);
    }

    public List<ModuleFormationResponse> findByFormation(Long formationId) {
        return moduleFormationRepository.findByFormationId(formationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ModuleFormationResponse update(Long id, ModuleFormationRequest request) {

        ModuleFormation module = moduleFormationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module introuvable"));

        Formation formation = formationRepository.findById(request.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        module.setLibelle(request.getLibelle());
        module.setCoefficient(request.getCoefficient() != null ? request.getCoefficient() : 1);
        module.setVolumeHoraire(request.getVolumeHoraire() != null ? request.getVolumeHoraire() : 0);
        module.setSemestre(request.getSemestre());
        module.setDescription(request.getDescription());

        if (request.getActive() != null) {
            module.setActive(request.getActive());
        }

        module.setFormation(formation);

        return mapToResponse(moduleFormationRepository.save(module));
    }

    public void delete(Long id) {
        if (!moduleFormationRepository.existsById(id)) {
            throw new RuntimeException("Module introuvable");
        }

        moduleFormationRepository.deleteById(id);
    }

    private String generateUniqueCode() {
        String code = moduleCodeGenerator.generate();

        while (moduleFormationRepository.existsByCodeModule(code)) {
            code = moduleCodeGenerator.generate();
        }

        return code;
    }

    private ModuleFormationResponse mapToResponse(ModuleFormation module) {
        return ModuleFormationResponse.builder()
                .id(module.getId())
                .codeModule(module.getCodeModule())
                .libelle(module.getLibelle())
                .coefficient(module.getCoefficient())
                .volumeHoraire(module.getVolumeHoraire())
                .semestre(module.getSemestre())
                .description(module.getDescription())
                .active(module.getActive())
                .formationId(module.getFormation() != null ? module.getFormation().getId() : null)
                .formationCode(module.getFormation() != null ? module.getFormation().getCodeFormation() : null)
                .formationIntitule(module.getFormation() != null ? module.getFormation().getIntitule() : null)
                .formationNiveau(module.getFormation() != null ? module.getFormation().getNiveau() : null)
                .build();
    }
}