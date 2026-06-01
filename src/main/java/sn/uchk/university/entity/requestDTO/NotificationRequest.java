package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationRequest {

    private String titre;

    private String message;

    private String typeNotification;

    private Long userId;
}