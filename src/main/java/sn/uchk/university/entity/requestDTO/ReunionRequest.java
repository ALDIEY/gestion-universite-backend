package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class ReunionRequest {

    private String titre;

    private String typeReunion;

    private LocalDate dateReunion;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private String lieu;

    private String statut;

    private String ordreDuJour;
}