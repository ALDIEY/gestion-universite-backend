package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.Etudiant;
import sn.uchk.university.entity.Formation;
import sn.uchk.university.entity.Inscription;
import sn.uchk.university.entity.requestDTO.InscriptionRequest;
import sn.uchk.university.entity.responseDTO.InscriptionResponse;
import sn.uchk.university.repository.EtudiantRepository;
import sn.uchk.university.repository.FormationRepository;
import sn.uchk.university.repository.InscriptionRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InscriptionService {

    private final InscriptionRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final FormationRepository formationRepository;

    public InscriptionResponse create(InscriptionRequest request) {

        Etudiant etudiant = etudiantRepository.findById(request.getEtudiantId())
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        Formation formation = formationRepository.findById(request.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        String anneeAcademique = request.getAnneeAcademique() != null
                ? request.getAnneeAcademique()
                : "2025-2026";

        boolean alreadyExists =
                inscriptionRepository.existsByEtudiantIdAndFormationIdAndAnneeAcademique(
                        request.getEtudiantId(),
                        request.getFormationId(),
                        anneeAcademique
                );

        if (alreadyExists) {
            throw new RuntimeException("Cet étudiant est déjà inscrit à cette formation pour cette année académique");
        }

        Inscription inscription = Inscription.builder()
                .dateInscription(request.getDateInscription() != null ? request.getDateInscription() : LocalDate.now())
                .anneeAcademique(anneeAcademique)
                .statut(request.getStatut() != null ? request.getStatut() : "INSCRIT")
                .commentaire(request.getCommentaire())
                .etudiant(etudiant)
                .formation(formation)
                .build();

        return mapToResponse(inscriptionRepository.save(inscription));
    }

    public List<InscriptionResponse> findAll() {
        return inscriptionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public InscriptionResponse findById(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable"));

        return mapToResponse(inscription);
    }

    public List<InscriptionResponse> findByEtudiant(Long etudiantId) {
        return inscriptionRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<InscriptionResponse> findByFormation(Long formationId) {
        return inscriptionRepository.findByFormationId(formationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public InscriptionResponse update(Long id, InscriptionRequest request) {

        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable"));

        Etudiant etudiant = etudiantRepository.findById(request.getEtudiantId())
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        Formation formation = formationRepository.findById(request.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        inscription.setDateInscription(request.getDateInscription());
        inscription.setAnneeAcademique(request.getAnneeAcademique());
        inscription.setStatut(request.getStatut());
        inscription.setCommentaire(request.getCommentaire());
        inscription.setEtudiant(etudiant);
        inscription.setFormation(formation);

        return mapToResponse(inscriptionRepository.save(inscription));
    }

    public void delete(Long id) {
        if (!inscriptionRepository.existsById(id)) {
            throw new RuntimeException("Inscription introuvable");
        }

        inscriptionRepository.deleteById(id);
    }

    private InscriptionResponse mapToResponse(Inscription inscription) {
        return InscriptionResponse.builder()
                .id(inscription.getId())
                .dateInscription(inscription.getDateInscription())
                .anneeAcademique(inscription.getAnneeAcademique())
                .statut(inscription.getStatut())
                .commentaire(inscription.getCommentaire())

                .etudiantId(inscription.getEtudiant() != null ? inscription.getEtudiant().getId() : null)
                .ine(inscription.getEtudiant() != null ? inscription.getEtudiant().getIne() : null)
                .nomEtudiant(
                        inscription.getEtudiant() != null && inscription.getEtudiant().getUser() != null
                                ? inscription.getEtudiant().getUser().getNom()
                                : null
                )
                .prenomEtudiant(
                        inscription.getEtudiant() != null && inscription.getEtudiant().getUser() != null
                                ? inscription.getEtudiant().getUser().getPrenom()
                                : null
                )

                .formationId(inscription.getFormation() != null ? inscription.getFormation().getId() : null)
                .codeFormation(inscription.getFormation() != null ? inscription.getFormation().getCodeFormation() : null)
                .intituleFormation(inscription.getFormation() != null ? inscription.getFormation().getIntitule() : null)
                .build();
    }
}