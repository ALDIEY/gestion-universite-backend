package sn.uchk.university.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uchk.university.auth.dto.AuthResponse;
import sn.uchk.university.auth.dto.LoginRequest;
import sn.uchk.university.auth.dto.RegisterRequest;
import sn.uchk.university.auth.dto.UserConnectedDto;
import sn.uchk.university.user.entity.Role;
import sn.uchk.university.user.entity.User;
import sn.uchk.university.user.repository.RoleRepository;
import sn.uchk.university.user.repository.UserRepository;
import sn.uchk.university.auth.security.JwtService;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email existe déjà");
        }

        Role role = roleRepository.findByNom(request.getRole())
                .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + request.getRole()));

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

        return AuthResponse.builder()
                .token(null)
                .tokenType(null)
                .user(UserConnectedDto.builder()
                        .id(savedUser.getId())
                        .nom(savedUser.getNom())
                        .prenom(savedUser.getPrenom())
                        .email(savedUser.getEmail())
                        .telephone(savedUser.getTelephone())
                        .actif(savedUser.getActif())
                        .roles(savedUser.getRoles().stream()
                                .map(Role::getNom)
                                .collect(Collectors.toSet()))
                        .build())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        String token = jwtService.generateToken(user);

        UserConnectedDto userConnected = UserConnectedDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .actif(user.getActif())
                .roles(user.getRoles()
                        .stream()
                        .map(Role::getNom)
                        .collect(Collectors.toSet()))
                .build();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userConnected)
                .build();
    }
}