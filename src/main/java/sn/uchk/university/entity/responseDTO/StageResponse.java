package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class StageResponse {

    private Long id;

    private String codeStage;

    private String sujet;

    private String typeStage;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String statut;

    private String appreciation;

    private Double noteFinale;

    private Long etudiantId;

    private String ine;

    private String nomEtudiant;

    private String prenomEtudiant;

    private Long partenaireId;

    private String partenaireNom;

    private Long encadrantAcademiqueId;

    private String encadrantNom;

    private String encadrantPrenom;
}