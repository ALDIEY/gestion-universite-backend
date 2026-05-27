package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ModuleFormationResponse {

    private Long id;

    private String codeModule;

    private String libelle;

    private Integer coefficient;

    private Integer volumeHoraire;

    private String semestre;

    private String description;

    private Boolean active;

    private Long formationId;

    private String formationCode;

    private String formationIntitule;

    private String formationNiveau;
}