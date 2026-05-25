package sn.uchk.university.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;
import sn.uchk.university.user.entity.User;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    private String codeDocument;

    private String titre;

    private String typeDocument;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String fichier;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
}