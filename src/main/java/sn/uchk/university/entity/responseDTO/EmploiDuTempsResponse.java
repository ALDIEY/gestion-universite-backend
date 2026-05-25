package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
public class EmploiDuTempsResponse {

    private Long id;

    private LocalDate dateCours;

    private String jour;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private String salle;

    private String statut;

    private Long coursId;
    private String coursTitre;
    private String typeCours;

    private Long formationId;
    private String formationCode;
    private String formationIntitule;

    private Long formateurId;
    private String formateurCode;
    private String formateurNom;
    private String formateurPrenom;
}