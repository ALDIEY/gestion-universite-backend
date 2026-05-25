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

    @Column(nullable = false)
    private String libelle;

    private String codeModule;

    private Integer coefficient;

    private Integer volumeHoraire;

    private String description;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;
}