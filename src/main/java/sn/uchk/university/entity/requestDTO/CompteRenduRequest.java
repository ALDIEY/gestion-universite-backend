package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompteRenduRequest {

    private String titre;

    private String contenu;

    private String fichierUrl;

    private Boolean publie;

    private Long reunionId;
}