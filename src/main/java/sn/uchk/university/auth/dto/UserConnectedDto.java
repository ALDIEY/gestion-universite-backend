package sn.uchk.university.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
public class UserConnectedDto {

    private Long id;

    private String nom;

    private String prenom;

    private String email;

    private String telephone;

    private Boolean actif;

    private Set<String> roles;
}