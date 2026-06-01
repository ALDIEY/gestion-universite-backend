package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PartenaireRequest {

    private String nom;

    private String domaine;

    private String contact;

    private String email;

    private String telephone;

    private String adresse;

    private String typePartenaire;

    private Boolean actif;
}