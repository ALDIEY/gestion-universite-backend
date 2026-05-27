package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uchk.university.common.utils.FormateurCodeGenerator;
import sn.uchk.university.entity.Formateur;
import sn.uchk.university.entity.requestDTO.FormateurRequest;
import sn.uchk.university.entity.responseDTO.FormateurResponse;
import sn.uchk.university.repository.FormateurRepository;
import sn.uchk.university.user.entity.Role;
import sn.uchk.university.user.entity.User;
import sn.uchk.university.user.repository.RoleRepository;
import sn.uchk.university.user.repository.UserRepository;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FormateurService {

    private final FormateurRepository formateurRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final FormateurCodeGenerator formateurCodeGenerator;

    public FormateurResponse create(FormateurRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email existe déjà");
        }

        String roleName = request.getRole() != null && !request.getRole().isBlank()
                ? request.getRole()
                : "ENSEIGNANT";

        Role role = roleRepository.findByNom(roleName)
                .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + roleName));

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telephone(request.getTelephone())
                .actif(true)
                .roles(Set.of(role))
                .build();

        User savedUser = userRepository.save(user);

        String codeFormateur = generateUniqueCode();

        Formateur formateur = Formateur.builder()
                .codeFormateur(codeFormateur)
                .typeFormateur(request.getTypeFormateur())
                .specialite(request.getSpecialite())
                .grade(request.getGrade())
                .statut(request.getStatut() != null ? request.getStatut() : "ACTIF")
                .user(savedUser)
                .build();

        return mapToResponse(formateurRepository.save(formateur));
    }

    public List<FormateurResponse> findAll() {
        return formateurRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public FormateurResponse findById(Long id) {
        Formateur formateur = formateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formateur introuvable"));

        return mapToResponse(formateur);
    }

    public FormateurResponse findByCode(String codeFormateur) {
        Formateur formateur = formateurRepository.findByCodeFormateur(codeFormateur)
                .orElseThrow(() -> new RuntimeException("Formateur introuvable"));

        return mapToResponse(formateur);
    }

    public FormateurResponse update(Long id, FormateurRequest request) {

        Formateur formateur = formateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formateur introuvable"));

        formateur.setTypeFormateur(request.getTypeFormateur());
        formateur.setSpecialite(request.getSpecialite());
        formateur.setGrade(request.getGrade());
        formateur.setStatut(request.getStatut());

        if (formateur.getUser() != null) {
            User user = formateur.getUser();

            user.setNom(request.getNom());
            user.setPrenom(request.getPrenom());
            user.setEmail(request.getEmail());
            user.setTelephone(request.getTelephone());

            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            if (request.getRole() != null && !request.getRole().isBlank()) {
                Role role = roleRepository.findByNom(request.getRole())
                        .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + request.getRole()));

                user.setRoles(Set.of(role));
            }

            userRepository.save(user);
        }

        return mapToResponse(formateurRepository.save(formateur));
    }

    public void delete(Long id) {
        if (!formateurRepository.existsById(id)) {
            throw new RuntimeException("Formateur introuvable");
        }

        formateurRepository.deleteById(id);
    }

    private String generateUniqueCode() {
        String code = formateurCodeGenerator.generate();

        while (formateurRepository.existsByCodeFormateur(code)) {
            code = formateurCodeGenerator.generate();
        }

        return code;
    }

    private FormateurResponse mapToResponse(Formateur formateur) {
        return FormateurResponse.builder()
                .id(formateur.getId())
                .codeFormateur(formateur.getCodeFormateur())
                .typeFormateur(formateur.getTypeFormateur())
                .specialite(formateur.getSpecialite())
                .grade(formateur.getGrade())
                .statut(formateur.getStatut())

                .userId(formateur.getUser() != null ? formateur.getUser().getId() : null)
                .nom(formateur.getUser() != null ? formateur.getUser().getNom() : null)
                .prenom(formateur.getUser() != null ? formateur.getUser().getPrenom() : null)
                .email(formateur.getUser() != null ? formateur.getUser().getEmail() : null)
                .telephone(formateur.getUser() != null ? formateur.getUser().getTelephone() : null)
                .actif(formateur.getUser() != null ? formateur.getUser().getActif() : null)
                .build();
    }
}