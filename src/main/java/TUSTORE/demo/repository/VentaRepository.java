package TUSTORE.demo.repository;

import TUSTORE.demo.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByCajaId(Long cajaId);
    List<Venta> findByUsuarioId(Long usuarioId);
    List<Venta> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<Venta> findByUsuarioIdAndFechaBetween(Long usuarioId, LocalDateTime fechaInicio, LocalDateTime fechaFin);
}