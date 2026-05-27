package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class InscriptionRequest {

    private LocalDate dateInscription;

    private String anneeAcademique;

    private String statut;

    private String commentaire;

    private Long etudiantId;

    private Long formationId;
}