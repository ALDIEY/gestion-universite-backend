package sn.uchk.university.entity.requestDTO;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EtudiantRequest {

    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String telephone;

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
}