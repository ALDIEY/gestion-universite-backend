package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;
import sn.uchk.university.entity.Formation;

import java.time.LocalTime;

@Entity
@Table(name = "emplois_du_temps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploiDuTemps extends BaseEntity {

    private String jour;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    private String salle;

    private String module;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;
}