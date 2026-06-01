package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.NotificationRequest;
import sn.uchk.university.entity.responseDTO.NotificationResponse;
import sn.uchk.university.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public NotificationResponse create(@RequestBody NotificationRequest request) {
        return notificationService.create(request);
    }

    @GetMapping
    public List<NotificationResponse> findAll() {
        return notificationService.findAll();
    }

    @GetMapping("/{id}")
    public NotificationResponse findById(@PathVariable Long id) {
        return notificationService.findById(id);
    }

    @GetMapping("/user/{userId}")
    public List<NotificationResponse> findByUser(@PathVariable Long userId) {
        return notificationService.findByUser(userId);
    }

    @GetMapping("/user/{userId}/unread")
    public List<NotificationResponse> findUnreadByUser(@PathVariable Long userId) {
        return notificationService.findUnreadByUser(userId);
    }

    @GetMapping("/user/{userId}/unread/count")
    public long countUnreadByUser(@PathVariable Long userId) {
        return notificationService.countUnreadByUser(userId);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        notificationService.delete(id);
        return "Notification supprimée avec succès";
    }
}