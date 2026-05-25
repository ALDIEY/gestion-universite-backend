package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class FormationRequest {

    private String libelle;

    private String typeFormation;

    private String niveau;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private Double montantFinancement;

    private String typeFinancement;

    private Integer nbHommes;

    private Integer nbFemmes;

    private String description;

    private Boolean active;
}