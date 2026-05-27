package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FormateurResponse {

    private Long id;
    private String codeFormateur;

    private String typeFormateur;
    private String specialite;
    private String grade;
    private String statut;

    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Boolean actif;
}