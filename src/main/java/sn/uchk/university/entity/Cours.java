package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

@Entity
@Table(name = "cours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cours extends BaseEntity {

    private String titre;

    private String typeCours;

    private String description;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private ModuleFormation module;

    @ManyToOne
    @JoinColumn(name = "formateur_id")
    private Formateur formateur;
}