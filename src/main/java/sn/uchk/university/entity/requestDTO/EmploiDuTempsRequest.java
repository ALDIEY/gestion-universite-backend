package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class EmploiDuTempsRequest {

    private LocalDate dateCours;

    private String jour;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private String salle;

    private String statut;

    private Long coursId;

    private Long formationId;

    private Long formateurId;
}