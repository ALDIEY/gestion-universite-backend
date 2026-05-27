package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleFormationRequest {

    private String libelle;

    private Integer coefficient;

    private Integer volumeHoraire;

    private String semestre;

    private String description;

    private Boolean active;

    private Long formationId;
}