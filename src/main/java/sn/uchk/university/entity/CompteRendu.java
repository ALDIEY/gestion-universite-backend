package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;

@Entity
@Table(name = "comptes_rendus")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompteRendu extends BaseEntity {

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "LONGTEXT")
    private String contenu;

    private String fichierUrl;

    private Boolean publie;

    @OneToOne
    @JoinColumn(name = "reunion_id")
    private Reunion reunion;
}