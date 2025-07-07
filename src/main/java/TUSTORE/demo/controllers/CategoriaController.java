package TUSTORE.demo.controllers;

import TUSTORE.demo.model.Categoria;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.services.CategoriaService;
import TUSTORE.demo.repository.UsuarioRepository;
import TUSTORE.demo.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<Categoria>> getAllCategorias() {
        List<Categoria> categorias = categoriaService.findAll();
        return new ResponseEntity<>(categorias, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> getCategoriaById(@PathVariable("id") Long id) {
        return categoriaService.findById(id)
                .map(categoria -> new ResponseEntity<>(categoria, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categoria> createCategoria(@Valid @RequestBody Categoria categoria) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario administrador = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));
        
        categoria.setAdministrador(administrador);
        Categoria nuevaCategoria = categoriaService.save(categoria);
        return new ResponseEntity<>(nuevaCategoria, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categoria> updateCategoria(@PathVariable("id") Long id, @Valid @RequestBody Categoria categoria) {
        if (!categoriaService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario administrador = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        categoria.setId(id);
        categoria.setAdministrador(administrador);
        Categoria updatedCategoria = categoriaService.save(categoria);
        return new ResponseEntity<>(updatedCategoria, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteCategoria(@PathVariable("id") Long id) {
        if (!categoriaService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        categoriaService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}