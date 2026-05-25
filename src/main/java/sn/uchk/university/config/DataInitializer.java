package sn.uchk.university.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sn.uchk.university.user.entity.Role;
import sn.uchk.university.user.repository.RoleRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        List<String> roles = List.of(
                "ADMIN",
                "ADMINISTRATIF",
                "ENSEIGNANT",
                "TUTEUR",
                "RESPONSABLE_FORMATION",
                "APPUI_INSERTION",
                "ETUDIANT"
        );

        for (String roleName : roles) {
            if (roleRepository.findByNom(roleName).isEmpty()) {
                roleRepository.save(
                        Role.builder()
                                .nom(roleName)
                                .build()
                );
            }
        }
    }
}