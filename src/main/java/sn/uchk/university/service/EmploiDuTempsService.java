package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.Cours;
import sn.uchk.university.entity.EmploiDuTemps;
import sn.uchk.university.entity.Formateur;
import sn.uchk.university.entity.Formation;
import sn.uchk.university.entity.requestDTO.EmploiDuTempsRequest;
import sn.uchk.university.entity.responseDTO.EmploiDuTempsResponse;
import sn.uchk.university.repository.CoursRepository;
import sn.uchk.university.repository.EmploiDuTempsRepository;
import sn.uchk.university.repository.FormateurRepository;
import sn.uchk.university.repository.FormationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmploiDuTempsService {

    private final EmploiDuTempsRepository emploiDuTempsRepository;
    private final FormationRepository formationRepository;
    private final CoursRepository coursRepository;
    private final FormateurRepository formateurRepository;

    public EmploiDuTempsResponse create(EmploiDuTempsRequest request) {

        Formation formation = formationRepository.findById(request.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        Cours cours = null;
        if (request.getCoursId() != null) {
            cours = coursRepository.findById(request.getCoursId())
                    .orElseThrow(() -> new RuntimeException("Cours introuvable"));
        }

        Formateur formateur = null;
        if (request.getFormateurId() != null) {
            formateur = formateurRepository.findById(request.getFormateurId())
                    .orElseThrow(() -> new RuntimeException("Formateur introuvable"));
        }

        EmploiDuTemps emploi = EmploiDuTemps.builder()
                .dateCours(request.getDateCours())
                .jour(request.getJour())
                .heureDebut(request.getHeureDebut())
                .heureFin(request.getHeureFin())
                .salle(request.getSalle())
                .statut(request.getStatut() != null ? request.getStatut() : "PLANIFIE")
                .cours(cours)
                .formation(formation)
                .formateur(formateur)
                .build();

        return mapToResponse(emploiDuTempsRepository.save(emploi));
    }

    public List<EmploiDuTempsResponse> findAll() {
        return emploiDuTempsRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EmploiDuTempsResponse findById(Long id) {
        EmploiDuTemps emploi = emploiDuTempsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emploi du temps introuvable"));

        return mapToResponse(emploi);
    }

    public List<EmploiDuTempsResponse> findByFormation(Long formationId) {
        return emploiDuTempsRepository.findByFormationId(formationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EmploiDuTempsResponse> findByJour(String jour) {
        return emploiDuTempsRepository.findByJour(jour)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EmploiDuTempsResponse update(Long id, EmploiDuTempsRequest request) {

        EmploiDuTemps emploi = emploiDuTempsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emploi du temps introuvable"));

        Formation formation = formationRepository.findById(request.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        Cours cours = null;
        if (request.getCoursId() != null) {
            cours = coursRepository.findById(request.getCoursId())
                    .orElseThrow(() -> new RuntimeException("Cours introuvable"));
        }

        Formateur formateur = null;
        if (request.getFormateurId() != null) {
            formateur = formateurRepository.findById(request.getFormateurId())
                    .orElseThrow(() -> new RuntimeException("Formateur introuvable"));
        }

        emploi.setDateCours(request.getDateCours());
        emploi.setJour(request.getJour());
        emploi.setHeureDebut(request.getHeureDebut());
        emploi.setHeureFin(request.getHeureFin());
        emploi.setSalle(request.getSalle());
        emploi.setStatut(request.getStatut());
        emploi.setCours(cours);
        emploi.setFormation(formation);
        emploi.setFormateur(formateur);

        return mapToResponse(emploiDuTempsRepository.save(emploi));
    }

    public void delete(Long id) {
        if (!emploiDuTempsRepository.existsById(id)) {
            throw new RuntimeException("Emploi du temps introuvable");
        }

        emploiDuTempsRepository.deleteById(id);
    }

    private EmploiDuTempsResponse mapToResponse(EmploiDuTemps emploi) {
        return EmploiDuTempsResponse.builder()
                .id(emploi.getId())
                .dateCours(emploi.getDateCours())
                .jour(emploi.getJour())
                .heureDebut(emploi.getHeureDebut())
                .heureFin(emploi.getHeureFin())
                .salle(emploi.getSalle())
                .statut(emploi.getStatut())

                .coursId(emploi.getCours() != null ? emploi.getCours().getId() : null)
                .coursTitre(emploi.getCours() != null ? emploi.getCours().getTitre() : null)
                .typeCours(emploi.getCours() != null ? emploi.getCours().getTypeCours() : null)

                .formationId(emploi.getFormation() != null ? emploi.getFormation().getId() : null)
                .formationCode(emploi.getFormation() != null ? emploi.getFormation().getCodeFormation() : null)
                .formationIntitule(emploi.getFormation() != null ? emploi.getFormation().getIntitule() : null)

                .formateurId(emploi.getFormateur() != null ? emploi.getFormateur().getId() : null)
                .formateurCode(emploi.getFormateur() != null ? emploi.getFormateur().getCodeFormateur() : null)
                .formateurNom(
                        emploi.getFormateur() != null && emploi.getFormateur().getUser() != null
                                ? emploi.getFormateur().getUser().getNom()
                                : null
                )
                .formateurPrenom(
                        emploi.getFormateur() != null && emploi.getFormateur().getUser() != null
                                ? emploi.getFormateur().getUser().getPrenom()
                                : null
                )
                .build();
    }
}