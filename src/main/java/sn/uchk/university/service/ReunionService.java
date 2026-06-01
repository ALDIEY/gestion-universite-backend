package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.Reunion;
import sn.uchk.university.entity.requestDTO.ReunionRequest;
import sn.uchk.university.entity.responseDTO.ReunionResponse;
import sn.uchk.university.repository.ReunionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReunionService {

    private final ReunionRepository reunionRepository;

    public ReunionResponse create(ReunionRequest request) {

        Reunion reunion = Reunion.builder()
                .titre(request.getTitre())
                .typeReunion(request.getTypeReunion())
                .dateReunion(request.getDateReunion())
                .heureDebut(request.getHeureDebut())
                .heureFin(request.getHeureFin())
                .lieu(request.getLieu())
                .statut(request.getStatut() != null ? request.getStatut() : "PLANIFIEE")
                .ordreDuJour(request.getOrdreDuJour())
                .build();

        return mapToResponse(reunionRepository.save(reunion));
    }

    public List<ReunionResponse> findAll() {
        return reunionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ReunionResponse findById(Long id) {
        Reunion reunion = reunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));

        return mapToResponse(reunion);
    }

    public List<ReunionResponse> findByType(String typeReunion) {
        return reunionRepository.findByTypeReunion(typeReunion)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ReunionResponse> findByStatut(String statut) {
        return reunionRepository.findByStatut(statut)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ReunionResponse> findByDate(String date) {
        return reunionRepository.findByDateReunion(java.time.LocalDate.parse(date))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ReunionResponse update(Long id, ReunionRequest request) {

        Reunion reunion = reunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));

        reunion.setTitre(request.getTitre());
        reunion.setTypeReunion(request.getTypeReunion());
        reunion.setDateReunion(request.getDateReunion());
        reunion.setHeureDebut(request.getHeureDebut());
        reunion.setHeureFin(request.getHeureFin());
        reunion.setLieu(request.getLieu());
        reunion.setStatut(request.getStatut());
        reunion.setOrdreDuJour(request.getOrdreDuJour());

        return mapToResponse(reunionRepository.save(reunion));
    }

    public void delete(Long id) {
        if (!reunionRepository.existsById(id)) {
            throw new RuntimeException("Réunion introuvable");
        }

        reunionRepository.deleteById(id);
    }

    private ReunionResponse mapToResponse(Reunion reunion) {
        return ReunionResponse.builder()
                .id(reunion.getId())
                .titre(reunion.getTitre())
                .typeReunion(reunion.getTypeReunion())
                .dateReunion(reunion.getDateReunion())
                .heureDebut(reunion.getHeureDebut())
                .heureFin(reunion.getHeureFin())
                .lieu(reunion.getLieu())
                .statut(reunion.getStatut())
                .ordreDuJour(reunion.getOrdreDuJour())
                .createdAt(reunion.getCreatedAt())
                .updatedAt(reunion.getUpdatedAt())
                .build();
    }
}