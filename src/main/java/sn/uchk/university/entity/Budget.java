package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget extends BaseEntity {

    @Column(nullable = false)
    private String annee;

    private Double montantPrevisionnel;

    private Double montantRealise;

    private Double ecart;

    @Column(columnDefinition = "TEXT")
    private String noteOrientation;

    private String statut;
}