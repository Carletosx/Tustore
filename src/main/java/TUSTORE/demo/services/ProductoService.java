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

    public Producto getProductoById(Long id) {
        return productoRepository.findById(id).orElse(null);
    }

    public void actualizarStock(Long productoId, Integer cantidadVendida) {
        Producto producto = productoRepository.findById(productoId).orElse(null);
        if (producto != null) {
            producto.setStock(producto.getStock() - cantidadVendida);
            productoRepository.save(producto);
        }
    }

    public List<Producto> findByCategoriaIdAndAdministrador(Long categoryId, Usuario administrador) {
        return productoRepository.findByCategoriaIdAndAdministrador(categoryId, administrador);
    }
    
    public List<Producto> obtenerProductosConStockBajo(Integer stockMinimo) {
        return productoRepository.findByStockLessThan(stockMinimo);
    }
}