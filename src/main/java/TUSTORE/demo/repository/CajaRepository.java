package TUSTORE.demo.repository;

import TUSTORE.demo.model.Caja;
import TUSTORE.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Long> {
    Optional<Caja> findByUsuarioAndEstado(Usuario usuario, Caja.EstadoCaja estado);
    Optional<Caja> findByUsuarioIdAndEstado(Long usuarioId, Caja.EstadoCaja estado);
    List<Caja> findByUsuarioIdOrderByFechaAperturaDesc(Long usuarioId);
}