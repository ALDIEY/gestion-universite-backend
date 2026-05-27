package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CoursResponse {

    private Long id;

    private String titre;

    private String typeCours;

    private String description;

    private Long moduleId;

    private String moduleLibelle;

    private Long formationId;

    private String formationIntitule;

    private Long formateurId;

    private String formateurCode;

    private String formateurNom;

    private String formateurPrenom;
}