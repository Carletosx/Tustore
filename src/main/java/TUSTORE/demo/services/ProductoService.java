package TUSTORE.demo.services;

import TUSTORE.demo.model.Producto;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;
    
    public List<Producto> findAllByAdministrador(Usuario administrador) {
        return productoRepository.findByAdministrador(administrador);
    }
    
    public Optional<Producto> findByIdAndAdministrador(Long id, Usuario administrador) {
        return productoRepository.findByIdAndAdministrador(id, administrador);
    }
    
    public boolean existsByIdAndAdministrador(Long id, Usuario administrador) {
        return productoRepository.existsByIdAndAdministrador(id, administrador);
    }
    
    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }
    
    public void deleteById(Long id) {
        productoRepository.deleteById(id);
    }
}