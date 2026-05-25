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

    private String entreprise;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String statut;

    @Column(columnDefinition = "TEXT")
    private String bilan;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "partenaire_id")
    private Partenaire partenaire;
}