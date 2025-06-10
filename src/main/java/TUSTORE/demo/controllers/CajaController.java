package TUSTORE.demo.controllers;

import TUSTORE.demo.model.Caja;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.payload.request.CajaAperturaRequest;
import TUSTORE.demo.model.CajaCierreRequest;
import TUSTORE.demo.payload.response.MessageResponse;
import TUSTORE.demo.repository.UsuarioRepository;
import TUSTORE.demo.security.services.UserDetailsImpl;
import TUSTORE.demo.services.CajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;



@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/caja")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/abrir")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> abrirCaja(@Valid @RequestBody CajaAperturaRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        try {
            Caja caja = cajaService.abrirCaja(usuario, request.getMontoInicial(), request.getEncargadoApertura(), request.getDenominaciones(), request.getFechaApertura());
            return ResponseEntity.ok(new MessageResponse("Caja abierta con éxito. ID: " + caja.getId()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/cerrar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> cerrarCaja(@Valid @RequestBody CajaCierreRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        System.out.println("Received request to close cash register for user: " + usuario.getUsername());
        try {
            Caja caja = cajaService.cerrarCaja(usuario, request.getEfectivoFinal(), request.getObservaciones(), request.getEncargadoCierre());
            return ResponseEntity.ok(new MessageResponse("Caja cerrada con éxito. ID: " + caja.getId()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/estado")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> getEstadoCaja() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        Optional<Caja> cajaAbierta = cajaService.getCajaAbierta(usuario.getId());
        if (cajaAbierta.isPresent()) {
            return ResponseEntity.ok(java.util.Collections.singletonMap("estado", "ABIERTA"));
        } else {
            return ResponseEntity.ok(java.util.Collections.singletonMap("estado", "CERRADA"));
        }
    }

    @GetMapping("/resumen")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> getResumenCaja() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        try {
            Map<String, Object> resumen = cajaService.getResumenCaja(usuario.getId());
            return ResponseEntity.ok(resumen);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/historial")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> getHistorialCajas() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        try {
            List<Caja> historial = cajaService.getHistorialCajas(usuario.getId());
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}