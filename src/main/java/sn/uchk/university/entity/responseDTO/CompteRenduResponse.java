package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@Builder
public class CompteRenduResponse {

    private Long id;

    private String titre;

    private String contenu;

    private String fichierUrl;

    private Boolean publie;

    private Long reunionId;

    private String reunionTitre;

    private String typeReunion;

    private LocalDate dateReunion;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}