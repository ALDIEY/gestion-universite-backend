package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

import java.time.LocalDate;

@Entity
@Table(name = "formations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formation extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String codeFormation;

    @Column(nullable = false)
    private String intitule;

    private String niveau;

    private String typeFormation;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private Double montantFinancement;

    private String typeFinancement;

    private Integer nbHommes;

    private Integer nbFemmes;

    private Boolean active;
}