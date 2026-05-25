package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FormationResponse {

    private Long id;

    private String codeFormation;

    private String intitule;

    private String niveau;

    private String typeFormation;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private Double montantFinancement;

    private String typeFinancement;

    private Integer nbHommes;

    private Integer nbFemmes;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}