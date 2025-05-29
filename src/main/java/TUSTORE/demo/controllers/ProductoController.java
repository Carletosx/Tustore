package TUSTORE.demo.controllers;

import TUSTORE.demo.model.Producto;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.repository.UsuarioRepository;
import TUSTORE.demo.security.services.UserDetailsImpl;
import TUSTORE.demo.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    @Autowired
    private ProductoService productoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        List<Producto> productos = productoService.findAllByAdministrador(admin);
        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable("id") Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        return productoService.findByIdAndAdministrador(id, admin)
                .map(producto -> new ResponseEntity<>(producto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> createProducto(@Valid @RequestBody Producto producto, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        producto.setAdministrador(admin);
        Producto nuevoProducto = productoService.save(producto);
        return new ResponseEntity<>(nuevoProducto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> updateProducto(
            @PathVariable("id") Long id,
            @Valid @RequestBody Producto producto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        
        if (!productoService.existsByIdAndAdministrador(id, admin)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        producto.setId(id);
        producto.setAdministrador(admin);
        Producto updatedProducto = productoService.save(producto);
        return new ResponseEntity<>(updatedProducto, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteProducto(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        
        if (!productoService.existsByIdAndAdministrador(id, admin)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        productoService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}