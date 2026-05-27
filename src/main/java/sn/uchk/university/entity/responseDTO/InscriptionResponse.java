package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class InscriptionResponse {

    private Long id;

    private LocalDate dateInscription;

    private String anneeAcademique;

    private String statut;

    private String commentaire;

    private Long etudiantId;

    private String ine;

    private String nomEtudiant;

    private String prenomEtudiant;

    private Long formationId;

    private String codeFormation;

    private String intituleFormation;
}