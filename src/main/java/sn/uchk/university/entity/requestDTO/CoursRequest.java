package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoursRequest {

    private String titre;

    private String typeCours;

    private String description;

    private Long moduleId;

    private Long formateurId;
}