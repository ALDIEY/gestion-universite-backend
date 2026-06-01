package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class NotificationResponse {

    private Long id;

    private String titre;

    private String message;

    private Boolean lu;

    private String typeNotification;

    private Long userId;

    private String nom;

    private String prenom;

    private String email;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}