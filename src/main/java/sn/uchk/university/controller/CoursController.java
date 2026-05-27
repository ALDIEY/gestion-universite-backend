package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.CoursRequest;
import sn.uchk.university.entity.responseDTO.CoursResponse;
import sn.uchk.university.service.CoursService;

import java.util.List;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CoursController {

    private final CoursService coursService;

    @PostMapping
    public CoursResponse create(@RequestBody CoursRequest request) {
        return coursService.create(request);
    }

    @GetMapping
    public List<CoursResponse> findAll() {
        return coursService.findAll();
    }

    @GetMapping("/{id}")
    public CoursResponse findById(@PathVariable Long id) {
        return coursService.findById(id);
    }

    @GetMapping("/module/{moduleId}")
    public List<CoursResponse> findByModule(@PathVariable Long moduleId) {
        return coursService.findByModule(moduleId);
    }

    @GetMapping("/formateur/{formateurId}")
    public List<CoursResponse> findByFormateur(@PathVariable Long formateurId) {
        return coursService.findByFormateur(formateurId);
    }

    @PutMapping("/{id}")
    public CoursResponse update(
            @PathVariable Long id,
            @RequestBody CoursRequest request
    ) {
        return coursService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        coursService.delete(id);
        return "Cours supprimé avec succès";
    }
}