package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.common.utils.FormationCodeGenerator;
import sn.uchk.university.entity.requestDTO.FormationRequest;
import sn.uchk.university.entity.responseDTO.FormationResponse;

import sn.uchk.university.entity.Formation;
import sn.uchk.university.repository.FormationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final FormationCodeGenerator formationCodeGenerator;

    public FormationResponse create(FormationRequest request) {

        if (formationRepository.existsByLibelle(request.getLibelle())) {
            throw new RuntimeException("Cette formation existe déjà");
        }

        String codeFormation = generateUniqueCode();

        Formation formation = Formation.builder()
                .codeFormation(codeFormation)
                .libelle(request.getLibelle())
                .typeFormation(request.getTypeFormation())
                .niveau(request.getNiveau())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .montantFinancement(request.getMontantFinancement())
                .typeFinancement(request.getTypeFinancement())
                .nbHommes(request.getNbHommes() != null ? request.getNbHommes() : 0)
                .nbFemmes(request.getNbFemmes() != null ? request.getNbFemmes() : 0)
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return mapToResponse(formationRepository.save(formation));
    }

    public List<FormationResponse> findAll() {
        return formationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public FormationResponse findById(Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        return mapToResponse(formation);
    }

    public FormationResponse findByCode(String codeFormation) {
        Formation formation = formationRepository.findByCodeFormation(codeFormation)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        return mapToResponse(formation);
    }

    public FormationResponse update(Long id, FormationRequest request) {

        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        formation.setLibelle(request.getLibelle());
        formation.setTypeFormation(request.getTypeFormation());
        formation.setNiveau(request.getNiveau());
        formation.setDateDebut(request.getDateDebut());
        formation.setDateFin(request.getDateFin());
        formation.setMontantFinancement(request.getMontantFinancement());
        formation.setTypeFinancement(request.getTypeFinancement());
        formation.setNbHommes(request.getNbHommes());
        formation.setNbFemmes(request.getNbFemmes());
        formation.setDescription(request.getDescription());

        if (request.getActive() != null) {
            formation.setActive(request.getActive());
        }

        return mapToResponse(formationRepository.save(formation));
    }

    public void delete(Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        formationRepository.delete(formation);
    }

    private String generateUniqueCode() {
        String code = formationCodeGenerator.generate();

        while (formationRepository.existsByCodeFormation(code)) {
            code = formationCodeGenerator.generate();
        }

        return code;
    }

    private FormationResponse mapToResponse(Formation formation) {
        return FormationResponse.builder()
                .id(formation.getId())
                .codeFormation(formation.getCodeFormation())
                .libelle(formation.getLibelle())
                .typeFormation(formation.getTypeFormation())
                .niveau(formation.getNiveau())
                .dateDebut(formation.getDateDebut())
                .dateFin(formation.getDateFin())
                .montantFinancement(formation.getMontantFinancement())
                .typeFinancement(formation.getTypeFinancement())
                .nbHommes(formation.getNbHommes())
                .nbFemmes(formation.getNbFemmes())
                .description(formation.getDescription())
                .active(formation.getActive())
                .createdAt(formation.getCreatedAt())
                .updatedAt(formation.getUpdatedAt())
                .build();
    }
}