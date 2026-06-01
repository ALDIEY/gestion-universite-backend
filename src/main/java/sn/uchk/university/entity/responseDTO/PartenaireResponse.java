package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PartenaireResponse {

    private Long id;

    private String nom;

    private String domaine;

    private String contact;

    private String email;

    private String telephone;

    private String adresse;

    private String typePartenaire;

    private Boolean actif;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}