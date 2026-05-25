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
    private String libelle;

    private String typeFormation;

    private String niveau;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private Double montantFinancement;

    private String typeFinancement;

    private Integer nbHommes;

    private Integer nbFemmes;

    private String description;

    private Boolean active;
}