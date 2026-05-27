package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.Cours;
import sn.uchk.university.entity.Formateur;
import sn.uchk.university.entity.ModuleFormation;
import sn.uchk.university.entity.requestDTO.CoursRequest;
import sn.uchk.university.entity.responseDTO.CoursResponse;
import sn.uchk.university.repository.CoursRepository;
import sn.uchk.university.repository.FormateurRepository;
import sn.uchk.university.repository.ModuleFormationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoursService {

    private final CoursRepository coursRepository;
    private final ModuleFormationRepository moduleFormationRepository;
    private final FormateurRepository formateurRepository;

    public CoursResponse create(CoursRequest request) {

        ModuleFormation module = moduleFormationRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module introuvable"));

        Formateur formateur = null;

        if (request.getFormateurId() != null) {
            formateur = formateurRepository.findById(request.getFormateurId())
                    .orElseThrow(() -> new RuntimeException("Formateur introuvable"));
        }

        Cours cours = Cours.builder()
                .titre(request.getTitre())
                .typeCours(request.getTypeCours())
                .description(request.getDescription())
                .module(module)
                .formateur(formateur)
                .build();

        return mapToResponse(coursRepository.save(cours));
    }

    public List<CoursResponse> findAll() {
        return coursRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CoursResponse findById(Long id) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        return mapToResponse(cours);
    }

    public List<CoursResponse> findByModule(Long moduleId) {
        return coursRepository.findByModuleId(moduleId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CoursResponse> findByFormateur(Long formateurId) {
        return coursRepository.findByFormateurId(formateurId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CoursResponse update(Long id, CoursRequest request) {

        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        ModuleFormation module = moduleFormationRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module introuvable"));

        Formateur formateur = null;

        if (request.getFormateurId() != null) {
            formateur = formateurRepository.findById(request.getFormateurId())
                    .orElseThrow(() -> new RuntimeException("Formateur introuvable"));
        }

        cours.setTitre(request.getTitre());
        cours.setTypeCours(request.getTypeCours());
        cours.setDescription(request.getDescription());
        cours.setModule(module);
        cours.setFormateur(formateur);

        return mapToResponse(coursRepository.save(cours));
    }

    public void delete(Long id) {
        if (!coursRepository.existsById(id)) {
            throw new RuntimeException("Cours introuvable");
        }

        coursRepository.deleteById(id);
    }

    private CoursResponse mapToResponse(Cours cours) {
        return CoursResponse.builder()
                .id(cours.getId())
                .titre(cours.getTitre())
                .typeCours(cours.getTypeCours())
                .description(cours.getDescription())

                .moduleId(cours.getModule() != null ? cours.getModule().getId() : null)
                .moduleLibelle(cours.getModule() != null ? cours.getModule().getLibelle() : null)

                .formationId(
                        cours.getModule() != null && cours.getModule().getFormation() != null
                                ? cours.getModule().getFormation().getId()
                                : null
                )
                .formationIntitule(
                        cours.getModule() != null && cours.getModule().getFormation() != null
                                ? cours.getModule().getFormation().getIntitule()
                                : null
                )

                .formateurId(cours.getFormateur() != null ? cours.getFormateur().getId() : null)
                .formateurCode(cours.getFormateur() != null ? cours.getFormateur().getCodeFormateur() : null)
                .formateurNom(
                        cours.getFormateur() != null && cours.getFormateur().getUser() != null
                                ? cours.getFormateur().getUser().getNom()
                                : null
                )
                .formateurPrenom(
                        cours.getFormateur() != null && cours.getFormateur().getUser() != null
                                ? cours.getFormateur().getUser().getPrenom()
                                : null
                )
                .build();
    }
}