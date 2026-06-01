package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.CompteRendu;
import sn.uchk.university.entity.Reunion;
import sn.uchk.university.entity.requestDTO.CompteRenduRequest;
import sn.uchk.university.entity.responseDTO.CompteRenduResponse;
import sn.uchk.university.repository.CompteRenduRepository;
import sn.uchk.university.repository.ReunionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompteRenduService {

    private final CompteRenduRepository compteRenduRepository;
    private final ReunionRepository reunionRepository;

    public CompteRenduResponse create(CompteRenduRequest request) {

        Reunion reunion = reunionRepository.findById(request.getReunionId())
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));

        if (compteRenduRepository.existsByReunionId(request.getReunionId())) {
            throw new RuntimeException("Cette réunion possède déjà un compte rendu");
        }

        CompteRendu compteRendu = CompteRendu.builder()
                .titre(request.getTitre())
                .contenu(request.getContenu())
                .fichierUrl(request.getFichierUrl())
                .publie(request.getPublie() != null ? request.getPublie() : false)
                .reunion(reunion)
                .build();

        return mapToResponse(compteRenduRepository.save(compteRendu));
    }

    public List<CompteRenduResponse> findAll() {
        return compteRenduRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CompteRenduResponse findById(Long id) {
        CompteRendu compteRendu = compteRenduRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compte rendu introuvable"));

        return mapToResponse(compteRendu);
    }

    public CompteRenduResponse findByReunion(Long reunionId) {
        CompteRendu compteRendu = compteRenduRepository.findByReunionId(reunionId)
                .orElseThrow(() -> new RuntimeException("Compte rendu introuvable"));

        return mapToResponse(compteRendu);
    }

    public CompteRenduResponse update(Long id, CompteRenduRequest request) {

        CompteRendu compteRendu = compteRenduRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compte rendu introuvable"));

        Reunion reunion = reunionRepository.findById(request.getReunionId())
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));

        compteRendu.setTitre(request.getTitre());
        compteRendu.setContenu(request.getContenu());
        compteRendu.setFichierUrl(request.getFichierUrl());
        compteRendu.setPublie(request.getPublie());
        compteRendu.setReunion(reunion);

        return mapToResponse(compteRenduRepository.save(compteRendu));
    }

    public void delete(Long id) {

        if (!compteRenduRepository.existsById(id)) {
            throw new RuntimeException("Compte rendu introuvable");
        }

        compteRenduRepository.deleteById(id);
    }

    private CompteRenduResponse mapToResponse(CompteRendu compteRendu) {

        return CompteRenduResponse.builder()
                .id(compteRendu.getId())
                .titre(compteRendu.getTitre())
                .contenu(compteRendu.getContenu())
                .fichierUrl(compteRendu.getFichierUrl())
                .publie(compteRendu.getPublie())

                .reunionId(
                        compteRendu.getReunion() != null
                                ? compteRendu.getReunion().getId()
                                : null
                )
                .reunionTitre(
                        compteRendu.getReunion() != null
                                ? compteRendu.getReunion().getTitre()
                                : null
                )
                .typeReunion(
                        compteRendu.getReunion() != null
                                ? compteRendu.getReunion().getTypeReunion()
                                : null
                )
                .dateReunion(
                        compteRendu.getReunion() != null
                                ? compteRendu.getReunion().getDateReunion()
                                : null
                )
                .heureDebut(
                        compteRendu.getReunion() != null
                                ? compteRendu.getReunion().getHeureDebut()
                                : null
                )
                .heureFin(
                        compteRendu.getReunion() != null
                                ? compteRendu.getReunion().getHeureFin()
                                : null
                )

                .createdAt(compteRendu.getCreatedAt())
                .updatedAt(compteRendu.getUpdatedAt())
                .build();
    }
}