package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentRequest {

    private String titre;

    private String typeDocument;

    private String statut;

    private String fichierUrl;

    private String description;

    private Long createdById;
}