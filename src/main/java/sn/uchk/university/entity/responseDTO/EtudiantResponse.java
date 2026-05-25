package sn.uchk.university.entity.responseDTO;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class EtudiantResponse {

    private Long id;
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

    private Long formationId;
    private String formationLibelle;

    private Long userId;
    private String nom;
    private String prenom;
    private String email;
}