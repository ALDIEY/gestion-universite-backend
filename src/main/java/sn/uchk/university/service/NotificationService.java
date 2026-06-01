package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.Notification;
import sn.uchk.university.entity.requestDTO.NotificationRequest;
import sn.uchk.university.entity.responseDTO.NotificationResponse;
import sn.uchk.university.repository.NotificationRepository;
import sn.uchk.university.user.entity.User;
import sn.uchk.university.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationResponse create(NotificationRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Notification notification = Notification.builder()
                .titre(request.getTitre())
                .message(request.getMessage())
                .typeNotification(request.getTypeNotification())
                .lu(false)
                .user(user)
                .build();

        return mapToResponse(notificationRepository.save(notification));
    }

    public List<NotificationResponse> findAll() {
        return notificationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public NotificationResponse findById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));

        return mapToResponse(notification);
    }

    public List<NotificationResponse> findByUser(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<NotificationResponse> findUnreadByUser(Long userId) {
        return notificationRepository.findByUserIdAndLuFalse(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long countUnreadByUser(Long userId) {
        return notificationRepository.countByUserIdAndLuFalse(userId);
    }

    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));

        notification.setLu(true);

        return mapToResponse(notificationRepository.save(notification));
    }

    public void delete(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification introuvable");
        }

        notificationRepository.deleteById(id);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .titre(notification.getTitre())
                .message(notification.getMessage())
                .lu(notification.getLu())
                .typeNotification(notification.getTypeNotification())

                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .nom(notification.getUser() != null ? notification.getUser().getNom() : null)
                .prenom(notification.getUser() != null ? notification.getUser().getPrenom() : null)
                .email(notification.getUser() != null ? notification.getUser().getEmail() : null)

                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}