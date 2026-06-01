package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.Partenaire;
import sn.uchk.university.entity.requestDTO.PartenaireRequest;
import sn.uchk.university.entity.responseDTO.PartenaireResponse;
import sn.uchk.university.repository.PartenaireRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartenaireService {

    private final PartenaireRepository partenaireRepository;

    public PartenaireResponse create(PartenaireRequest request) {

        if (partenaireRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Ce partenaire existe déjà");
        }

        Partenaire partenaire = Partenaire.builder()
                .nom(request.getNom())
                .domaine(request.getDomaine())
                .contact(request.getContact())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .typePartenaire(request.getTypePartenaire())
                .actif(request.getActif() != null ? request.getActif() : true)
                .build();

        return mapToResponse(partenaireRepository.save(partenaire));
    }

    public List<PartenaireResponse> findAll() {
        return partenaireRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PartenaireResponse findById(Long id) {
        Partenaire partenaire = partenaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partenaire introuvable"));

        return mapToResponse(partenaire);
    }

    public List<PartenaireResponse> findByDomaine(String domaine) {
        return partenaireRepository.findByDomaine(domaine)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<PartenaireResponse> findByType(String typePartenaire) {
        return partenaireRepository.findByTypePartenaire(typePartenaire)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<PartenaireResponse> findActive() {
        return partenaireRepository.findByActifTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PartenaireResponse update(Long id, PartenaireRequest request) {

        Partenaire partenaire = partenaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partenaire introuvable"));

        partenaire.setNom(request.getNom());
        partenaire.setDomaine(request.getDomaine());
        partenaire.setContact(request.getContact());
        partenaire.setEmail(request.getEmail());
        partenaire.setTelephone(request.getTelephone());
        partenaire.setAdresse(request.getAdresse());
        partenaire.setTypePartenaire(request.getTypePartenaire());

        if (request.getActif() != null) {
            partenaire.setActif(request.getActif());
        }

        return mapToResponse(partenaireRepository.save(partenaire));
    }

    public PartenaireResponse activate(Long id) {
        Partenaire partenaire = partenaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partenaire introuvable"));

        partenaire.setActif(true);

        return mapToResponse(partenaireRepository.save(partenaire));
    }

    public PartenaireResponse deactivate(Long id) {
        Partenaire partenaire = partenaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partenaire introuvable"));

        partenaire.setActif(false);

        return mapToResponse(partenaireRepository.save(partenaire));
    }

    public void delete(Long id) {
        if (!partenaireRepository.existsById(id)) {
            throw new RuntimeException("Partenaire introuvable");
        }

        partenaireRepository.deleteById(id);
    }

    private PartenaireResponse mapToResponse(Partenaire partenaire) {
        return PartenaireResponse.builder()
                .id(partenaire.getId())
                .nom(partenaire.getNom())
                .domaine(partenaire.getDomaine())
                .contact(partenaire.getContact())
                .email(partenaire.getEmail())
                .telephone(partenaire.getTelephone())
                .adresse(partenaire.getAdresse())
                .typePartenaire(partenaire.getTypePartenaire())
                .actif(partenaire.getActif())
                .createdAt(partenaire.getCreatedAt())
                .updatedAt(partenaire.getUpdatedAt())
                .build();
    }
}