package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class DocumentResponse {

    private Long id;

    private String codeDocument;

    private String titre;

    private String typeDocument;

    private String statut;

    private String fichierUrl;

    private String description;

    private Long createdById;

    private String createdByNom;

    private String createdByPrenom;

    private String createdByEmail;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}