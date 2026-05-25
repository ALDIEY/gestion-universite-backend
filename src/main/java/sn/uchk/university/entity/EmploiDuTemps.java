package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "emplois_du_temps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploiDuTemps extends BaseEntity {

    private LocalDate dateCours;

    private String jour;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private String salle;

    private String statut;

    @ManyToOne
    @JoinColumn(name = "cours_id")
    private Cours cours;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;

    @ManyToOne
    @JoinColumn(name = "formateur_id")
    private Formateur formateur;
}