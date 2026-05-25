package sn.uchk.university.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.uchk.university.common.entity.BaseEntity;
import sn.uchk.university.user.entity.User;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String message;

    private Boolean lu = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}