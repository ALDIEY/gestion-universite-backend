package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reunions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reunion extends BaseEntity {

    @Column(nullable = false)
    private String titre;

    private String typeReunion;

    private LocalDate dateReunion;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private String lieu;

    private String statut;

    @Column(columnDefinition = "TEXT")
    private String ordreDuJour;
}