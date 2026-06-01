package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StageRequest {

    private String sujet;

    private String typeStage;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String statut;

    private String appreciation;

    private Double noteFinale;

    private Long etudiantId;

    private Long partenaireId;

    private Long encadrantAcademiqueId;
}