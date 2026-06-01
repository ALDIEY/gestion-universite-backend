package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

import java.time.LocalDate;

@Entity
@Table(name = "stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stage extends BaseEntity {

    @Column(unique = true)
    private String codeStage;

    private String sujet;

    private String typeStage;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String statut;

    private String appreciation;

    private Double noteFinale;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "partenaire_id")
    private Partenaire partenaire;

    @ManyToOne
    @JoinColumn(name = "formateur_id")
    private Formateur encadrantAcademique;
}