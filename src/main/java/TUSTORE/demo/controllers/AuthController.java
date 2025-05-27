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
        // Verificar si ya existe algún usuario administrador
        if (usuarioRepository.count() > 0) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El registro inicial de administrador ya fue realizado. Los nuevos usuarios deben ser creados por un administrador."));
        }

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

        // Crear nueva cuenta de administrador
        Usuario usuario = new Usuario(signUpRequest.getUsername(),
                                 signUpRequest.getEmail(),
                                 encoder.encode(signUpRequest.getPassword()));

        // Asignar rol de administrador
        Set<Rol> roles = new HashSet<>();
        Rol adminRole = rolRepository.findByNombre(ERol.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Rol de administrador no encontrado."));
        roles.add(adminRole);

        usuario.setRoles(roles);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(new MessageResponse("Usuario registrado exitosamente!"));
    }
}