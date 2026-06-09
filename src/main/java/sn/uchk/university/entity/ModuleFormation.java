package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

@Entity
@Table(name = "modules_formation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleFormation extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String codeModule;

    @Column(nullable = false)
    private String libelle;

    private Integer coefficient;

    private Integer volumeHoraire;
    private Integer credit;
    private String semestre;

    private String description;

    private Boolean active;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;
}