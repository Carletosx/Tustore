package TUSTORE.demo.repository;

import TUSTORE.demo.model.Producto;
import TUSTORE.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByAdministrador(Usuario administrador);
    Optional<Producto> findByIdAndAdministrador(Long id, Usuario administrador);
    boolean existsByIdAndAdministrador(Long id, Usuario administrador);
    List<Producto> findByCategoriaId(Long categoriaId);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByStockLessThan(Integer stockMinimo);
}