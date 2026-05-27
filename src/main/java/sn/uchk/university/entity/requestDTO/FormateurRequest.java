package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FormateurRequest {

    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String telephone;

    private String typeFormateur;
    private String specialite;
    private String grade;
    private String statut;

    private String role;
}