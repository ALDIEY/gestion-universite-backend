package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ReunionResponse {

    private Long id;

    private String titre;

    private String typeReunion;

    private LocalDate dateReunion;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private String lieu;

    private String statut;

    private String ordreDuJour;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}