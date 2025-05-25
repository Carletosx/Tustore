package TUSTORE.demo.repository;

import TUSTORE.demo.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoriaId(Long categoriaId);
    
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    
    List<Producto> findByStockLessThan(Integer stockMinimo);
}