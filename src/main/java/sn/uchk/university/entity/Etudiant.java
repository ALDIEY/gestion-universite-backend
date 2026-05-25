package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;
import sn.uchk.university.user.entity.User;

import java.time.LocalDate;

@Entity
@Table(name = "etudiants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Etudiant extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String ine;

    private LocalDate dateNaissance;
    private String lieuNaissance;
    private String sexe;
    private String nationalite;
    private String adresse;
    private String ville;
    private String pays;
    private String promo;
    private Integer anneeDebut;
    private Integer anneeSortie;
    private String diplomes;
    private String autresFormations;
    private String statut;
    private String photo;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}