package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

@Entity
@Table(name = "partenaires")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partenaire extends BaseEntity {

    private String nom;

    private String domaine;

    private String contact;

    private String email;

    private String adresse;

    private String typePartenaire;

    private Boolean actif;
}