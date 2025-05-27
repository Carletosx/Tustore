package TUSTORE.demo.controllers;

import TUSTORE.demo.model.ERol;
import TUSTORE.demo.model.Rol;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.payload.request.SignupRequest;
import TUSTORE.demo.payload.response.MessageResponse;
import TUSTORE.demo.repository.RolRepository;
import TUSTORE.demo.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.findAll();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable("id") Long id) {
        return usuarioService.findById(id)
                .map(usuario -> new ResponseEntity<>(usuario, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/crear-vendedor")
    public ResponseEntity<?> crearVendedor(@Valid @RequestBody SignupRequest signUpRequest) {
        return crearUsuarioConRol(signUpRequest, ERol.ROLE_CASHIER);
    }

    @PostMapping("/crear-almacenero")
    public ResponseEntity<?> crearAlmacenero(@Valid @RequestBody SignupRequest signUpRequest) {
        return crearUsuarioConRol(signUpRequest, ERol.ROLE_STOREKEEPER);
    }

    private ResponseEntity<?> crearUsuarioConRol(SignupRequest signUpRequest, ERol rolEnum) {
        if (usuarioService.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El nombre de usuario ya está en uso!"));
        }

        if (usuarioService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El email ya está en uso!"));
        }

        Usuario usuario = new Usuario(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<Rol> roles = new HashSet<>();
        Rol rol = rolRepository.findByNombre(rolEnum)
                .orElseThrow(() -> new RuntimeException("Error: Rol no encontrado."));
        roles.add(rol);
        usuario.setRoles(roles);

        usuarioService.save(usuario);

        return ResponseEntity.ok(new MessageResponse("Usuario registrado exitosamente!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUsuario(@PathVariable("id") Long id) {
        if (!usuarioService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        usuarioService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUsuario(@PathVariable("id") Long id, @Valid @RequestBody SignupRequest signUpRequest) {
        return usuarioService.findById(id).map(usuario -> {
            if (!usuario.getUsername().equals(signUpRequest.getUsername()) 
                    && usuarioService.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: El nombre de usuario ya está en uso!"));
            }

            if (!usuario.getEmail().equals(signUpRequest.getEmail()) 
                    && usuarioService.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: El email ya está en uso!"));
            }

            usuario.setUsername(signUpRequest.getUsername());
            usuario.setEmail(signUpRequest.getEmail());
            if (signUpRequest.getPassword() != null && !signUpRequest.getPassword().isEmpty()) {
                usuario.setPassword(encoder.encode(signUpRequest.getPassword()));
            }

            usuarioService.save(usuario);
            return ResponseEntity.ok(new MessageResponse("Usuario actualizado exitosamente!"));
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}