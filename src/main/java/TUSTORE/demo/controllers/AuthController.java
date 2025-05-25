package TUSTORE.demo.controllers;

import TUSTORE.demo.model.ERol;
import TUSTORE.demo.model.Rol;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.payload.request.LoginRequest;
import TUSTORE.demo.payload.request.SignupRequest;
import TUSTORE.demo.payload.response.JwtResponse;
import TUSTORE.demo.payload.response.MessageResponse;
import TUSTORE.demo.repository.RolRepository;
import TUSTORE.demo.repository.UsuarioRepository;
import TUSTORE.demo.security.jwt.JwtUtils;
import TUSTORE.demo.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    RolRepository rolRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                                             userDetails.getId(), 
                                             userDetails.getUsername(), 
                                             userDetails.getEmail(), 
                                             roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (usuarioRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El nombre de usuario ya está en uso!"));
        }

        if (usuarioRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El email ya está en uso!"));
        }

        // Crear nueva cuenta de usuario
        Usuario usuario = new Usuario(signUpRequest.getUsername(),
                                 signUpRequest.getEmail(),
                                 encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Rol> roles = new HashSet<>();

        if (strRoles == null) {
            Rol storekeeperRole = rolRepository.findByNombre(ERol.ROLE_STOREKEEPER)
                    .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
            roles.add(storekeeperRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                case "admin":
                    Rol adminRole = rolRepository.findByNombre(ERol.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
                    roles.add(adminRole);
                    break;
                case "cashier":
                    Rol cashierRole = rolRepository.findByNombre(ERol.ROLE_CASHIER)
                            .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
                    roles.add(cashierRole);
                    break;
                default:
                    Rol storekeeperRole = rolRepository.findByNombre(ERol.ROLE_STOREKEEPER)
                            .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
                    roles.add(storekeeperRole);
                }
            });
        }

        usuario.setRoles(roles);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(new MessageResponse("Usuario registrado exitosamente!"));
    }
}