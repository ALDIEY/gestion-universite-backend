package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;
import sn.uchk.university.user.entity.User;

@Entity
@Table(name = "formateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formateur extends BaseEntity {

    @Column(unique = true)
    private String codeFormateur;

    private String typeFormateur;

    private String specialite;

    private String gradeAcademique;

    private String departement;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}