package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.common.utils.IneGenerator;
import sn.uchk.university.entity.requestDTO.EtudiantRequest;
import sn.uchk.university.entity.responseDTO.EtudiantResponse;
import sn.uchk.university.entity.Etudiant;
import sn.uchk.university.entity.Formation;
import sn.uchk.university.repository.EtudiantRepository;
import sn.uchk.university.repository.FormationRepository;
import sn.uchk.university.user.entity.User;
import sn.uchk.university.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import sn.uchk.university.user.entity.Role;
import sn.uchk.university.user.repository.RoleRepository;

import java.util.Set;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final FormationRepository formationRepository;
    private final UserRepository userRepository;
    private final IneGenerator ineGenerator;
    private final  RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    public EtudiantResponse create(EtudiantRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email existe déjà");
        }

        Role roleEtudiant = roleRepository.findByNom("ETUDIANT")
                .orElseThrow(() -> new RuntimeException("Rôle ETUDIANT introuvable"));

        Formation formation = null;
        if (request.getFormationId() != null) {
            formation = formationRepository.findById(request.getFormationId())
                    .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        }

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telephone(request.getTelephone())
                .actif(true)
                .roles(Set.of(roleEtudiant))
                .build();

        User savedUser = userRepository.save(user);

        String ine = generateUniqueIne();

        Etudiant etudiant = Etudiant.builder()
                .ine(ine)
                .dateNaissance(request.getDateNaissance())
                .lieuNaissance(request.getLieuNaissance())
                .sexe(request.getSexe())
                .nationalite(request.getNationalite())
                .adresse(request.getAdresse())
                .ville(request.getVille())
                .pays(request.getPays())
                .promo(request.getPromo())
                .anneeDebut(request.getAnneeDebut())
                .anneeSortie(request.getAnneeSortie())
                .diplomes(request.getDiplomes())
                .autresFormations(request.getAutresFormations())
                .statut(request.getStatut() != null ? request.getStatut() : "ACTIF")
                .photo(request.getPhoto())
                .formation(formation)
                .user(savedUser)
                .build();

        return mapToResponse(etudiantRepository.save(etudiant));
    }

    public List<EtudiantResponse> findAll() {
        return etudiantRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EtudiantResponse findById(Long id) {
        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        return mapToResponse(etudiant);
    }

    public EtudiantResponse findByIne(String ine) {
        Etudiant etudiant = etudiantRepository.findByIne(ine)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        return mapToResponse(etudiant);
    }

    public EtudiantResponse update(Long id, EtudiantRequest request) {

        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        Formation formation = null;
        if (request.getFormationId() != null) {
            formation = formationRepository.findById(request.getFormationId())
                    .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        }

        etudiant.setDateNaissance(request.getDateNaissance());
        etudiant.setLieuNaissance(request.getLieuNaissance());
        etudiant.setSexe(request.getSexe());
        etudiant.setNationalite(request.getNationalite());
        etudiant.setAdresse(request.getAdresse());
        etudiant.setVille(request.getVille());
        etudiant.setPays(request.getPays());
        etudiant.setPromo(request.getPromo());
        etudiant.setAnneeDebut(request.getAnneeDebut());
        etudiant.setAnneeSortie(request.getAnneeSortie());
        etudiant.setDiplomes(request.getDiplomes());
        etudiant.setAutresFormations(request.getAutresFormations());
        etudiant.setStatut(request.getStatut());
        etudiant.setPhoto(request.getPhoto());
        etudiant.setFormation(formation);

        if (etudiant.getUser() != null) {
            User user = etudiant.getUser();

            user.setNom(request.getNom());
            user.setPrenom(request.getPrenom());
            user.setEmail(request.getEmail());
            user.setTelephone(request.getTelephone());

            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            userRepository.save(user);
        }

        return mapToResponse(etudiantRepository.save(etudiant));
    }

    public void delete(Long id) {
        if (!etudiantRepository.existsById(id)) {
            throw new RuntimeException("Étudiant introuvable");
        }

        etudiantRepository.deleteById(id);
    }

    private String generateUniqueIne() {
        String ine = ineGenerator.generate();

        while (etudiantRepository.existsByIne(ine)) {
            ine = ineGenerator.generate();
        }

        return ine;
    }

    private EtudiantResponse mapToResponse(Etudiant etudiant) {
        return EtudiantResponse.builder()
                .id(etudiant.getId())
                .ine(etudiant.getIne())
                .dateNaissance(etudiant.getDateNaissance())
                .lieuNaissance(etudiant.getLieuNaissance())
                .sexe(etudiant.getSexe())
                .nationalite(etudiant.getNationalite())
                .adresse(etudiant.getAdresse())
                .ville(etudiant.getVille())
                .pays(etudiant.getPays())
                .promo(etudiant.getPromo())
                .anneeDebut(etudiant.getAnneeDebut())
                .anneeSortie(etudiant.getAnneeSortie())
                .diplomes(etudiant.getDiplomes())
                .autresFormations(etudiant.getAutresFormations())
                .statut(etudiant.getStatut())
                .photo(etudiant.getPhoto())

                .formationId(etudiant.getFormation() != null ? etudiant.getFormation().getId() : null)
                .formationCode(etudiant.getFormation() != null ? etudiant.getFormation().getCodeFormation() : null)
                .formationIntitule(etudiant.getFormation() != null ? etudiant.getFormation().getIntitule() : null)
                .formationNiveau(etudiant.getFormation() != null ? etudiant.getFormation().getNiveau() : null)

                .userId(etudiant.getUser() != null ? etudiant.getUser().getId() : null)
                .nom(etudiant.getUser() != null ? etudiant.getUser().getNom() : null)
                .prenom(etudiant.getUser() != null ? etudiant.getUser().getPrenom() : null)
                .email(etudiant.getUser() != null ? etudiant.getUser().getEmail() : null)
                .telephone(etudiant.getUser() != null ? etudiant.getUser().getTelephone() : null)
                .actif(etudiant.getUser() != null ? etudiant.getUser().getActif() : null)
                .build();
    }
}