package TUSTORE.demo.controllers;

import TUSTORE.demo.model.Categoria;
import TUSTORE.demo.model.Producto;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.payload.request.CreateUpdateProductoRequest;
import TUSTORE.demo.repository.CategoriaRepository;
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
import java.util.Base64;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    @Autowired
    private ProductoService productoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        List<Producto> productos = productoService.findAllByAdministrador(admin);
        // Convert byte[] imagen to Base64 String for frontend
        productos.forEach(producto -> {
            if (producto.getImagen() != null) {
                producto.setImagenBase64(Base64.getEncoder().encodeToString(producto.getImagen()));
            }
        });
        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable("id") Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        return productoService.findByIdAndAdministrador(id, admin)
                .map(producto -> {
                    if (producto.getImagen() != null) {
                        producto.setImagenBase64(Base64.getEncoder().encodeToString(producto.getImagen()));
                    }
                    return new ResponseEntity<>(producto, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> createProducto(@Valid @RequestBody CreateUpdateProductoRequest request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Error: Categoría no encontrada."));

        Producto producto = new Producto();
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setCategoria(categoria);
        producto.setAdministrador(admin);

        if (request.getImagenBase64() != null && !request.getImagenBase64().isEmpty()) {
            producto.setImagen(Base64.getDecoder().decode(request.getImagenBase64()));
        }

        Producto nuevoProducto = productoService.save(producto);
        return new ResponseEntity<>(nuevoProducto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> updateProducto(
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateUpdateProductoRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Usuario admin = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        Producto existingProducto = productoService.findByIdAndAdministrador(id, admin)
                .orElseThrow(() -> new RuntimeException("Error: Producto no encontrado o no autorizado."));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Error: Categoría no encontrada."));

        existingProducto.setNombre(request.getNombre());
        existingProducto.setDescripcion(request.getDescripcion());
        existingProducto.setPrecio(request.getPrecio());
        existingProducto.setStock(request.getStock());
        existingProducto.setCategoria(categoria);

        if (request.getImagenBase64() != null && !request.getImagenBase64().isEmpty()) {
            existingProducto.setImagen(Base64.getDecoder().decode(request.getImagenBase64()));
        } else {
            existingProducto.setImagen(null); // Clear image if Base64 is empty
        }

        Producto updatedProducto = productoService.save(existingProducto);
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