package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.common.utils.StageCodeGenerator;
import sn.uchk.university.entity.Etudiant;
import sn.uchk.university.entity.Formateur;
import sn.uchk.university.entity.Partenaire;
import sn.uchk.university.entity.Stage;
import sn.uchk.university.entity.requestDTO.StageRequest;
import sn.uchk.university.entity.responseDTO.StageResponse;
import sn.uchk.university.repository.EtudiantRepository;
import sn.uchk.university.repository.FormateurRepository;
import sn.uchk.university.repository.PartenaireRepository;
import sn.uchk.university.repository.StageRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StageService {

    private final StageRepository stageRepository;
    private final EtudiantRepository etudiantRepository;
    private final PartenaireRepository partenaireRepository;
    private final FormateurRepository formateurRepository;
    private final StageCodeGenerator stageCodeGenerator;

    public StageResponse create(StageRequest request) {

        Etudiant etudiant = etudiantRepository.findById(request.getEtudiantId())
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        Partenaire partenaire = null;
        if (request.getPartenaireId() != null) {
            partenaire = partenaireRepository.findById(request.getPartenaireId())
                    .orElseThrow(() -> new RuntimeException("Partenaire introuvable"));
        }

        Formateur encadrant = null;
        if (request.getEncadrantAcademiqueId() != null) {
            encadrant = formateurRepository.findById(request.getEncadrantAcademiqueId())
                    .orElseThrow(() -> new RuntimeException("Encadrant académique introuvable"));
        }

        String codeStage = generateUniqueCode();

        Stage stage = Stage.builder()
                .codeStage(codeStage)
                .sujet(request.getSujet())
                .typeStage(request.getTypeStage())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .statut(request.getStatut() != null ? request.getStatut() : "EN_COURS")
                .appreciation(request.getAppreciation())
                .noteFinale(request.getNoteFinale())
                .etudiant(etudiant)
                .partenaire(partenaire)
                .encadrantAcademique(encadrant)
                .build();

        return mapToResponse(stageRepository.save(stage));
    }

    public List<StageResponse> findAll() {
        return stageRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public StageResponse findById(Long id) {
        Stage stage = stageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stage introuvable"));

        return mapToResponse(stage);
    }

    public List<StageResponse> findByEtudiant(Long etudiantId) {
        return stageRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<StageResponse> findByPartenaire(Long partenaireId) {
        return stageRepository.findByPartenaireId(partenaireId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<StageResponse> findByStatut(String statut) {
        return stageRepository.findByStatut(statut)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public StageResponse update(Long id, StageRequest request) {

        Stage stage = stageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stage introuvable"));

        Etudiant etudiant = etudiantRepository.findById(request.getEtudiantId())
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        Partenaire partenaire = null;
        if (request.getPartenaireId() != null) {
            partenaire = partenaireRepository.findById(request.getPartenaireId())
                    .orElseThrow(() -> new RuntimeException("Partenaire introuvable"));
        }

        Formateur encadrant = null;
        if (request.getEncadrantAcademiqueId() != null) {
            encadrant = formateurRepository.findById(request.getEncadrantAcademiqueId())
                    .orElseThrow(() -> new RuntimeException("Encadrant académique introuvable"));
        }

        stage.setSujet(request.getSujet());
        stage.setTypeStage(request.getTypeStage());
        stage.setDateDebut(request.getDateDebut());
        stage.setDateFin(request.getDateFin());
        stage.setStatut(request.getStatut());
        stage.setAppreciation(request.getAppreciation());
        stage.setNoteFinale(request.getNoteFinale());
        stage.setEtudiant(etudiant);
        stage.setPartenaire(partenaire);
        stage.setEncadrantAcademique(encadrant);

        return mapToResponse(stageRepository.save(stage));
    }

    public void delete(Long id) {
        if (!stageRepository.existsById(id)) {
            throw new RuntimeException("Stage introuvable");
        }

        stageRepository.deleteById(id);
    }

    private String generateUniqueCode() {
        String code = stageCodeGenerator.generate();

        while (stageRepository.existsByCodeStage(code)) {
            code = stageCodeGenerator.generate();
        }

        return code;
    }

    private StageResponse mapToResponse(Stage stage) {

        return StageResponse.builder()
                .id(stage.getId())
                .codeStage(stage.getCodeStage())
                .sujet(stage.getSujet())
                .typeStage(stage.getTypeStage())
                .dateDebut(stage.getDateDebut())
                .dateFin(stage.getDateFin())
                .statut(stage.getStatut())
                .appreciation(stage.getAppreciation())
                .noteFinale(stage.getNoteFinale())

                .etudiantId(stage.getEtudiant() != null ? stage.getEtudiant().getId() : null)
                .ine(stage.getEtudiant() != null ? stage.getEtudiant().getIne() : null)
                .nomEtudiant(
                        stage.getEtudiant() != null && stage.getEtudiant().getUser() != null
                                ? stage.getEtudiant().getUser().getNom()
                                : null
                )
                .prenomEtudiant(
                        stage.getEtudiant() != null && stage.getEtudiant().getUser() != null
                                ? stage.getEtudiant().getUser().getPrenom()
                                : null
                )

                .partenaireId(stage.getPartenaire() != null ? stage.getPartenaire().getId() : null)
                .partenaireNom(stage.getPartenaire() != null ? stage.getPartenaire().getNom() : null)

                .encadrantAcademiqueId(
                        stage.getEncadrantAcademique() != null
                                ? stage.getEncadrantAcademique().getId()
                                : null
                )
                .encadrantNom(
                        stage.getEncadrantAcademique() != null
                                && stage.getEncadrantAcademique().getUser() != null
                                ? stage.getEncadrantAcademique().getUser().getNom()
                                : null
                )
                .encadrantPrenom(
                        stage.getEncadrantAcademique() != null
                                && stage.getEncadrantAcademique().getUser() != null
                                ? stage.getEncadrantAcademique().getUser().getPrenom()
                                : null
                )
                .build();
    }
}