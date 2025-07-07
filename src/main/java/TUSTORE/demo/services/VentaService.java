package TUSTORE.demo.services;

import TUSTORE.demo.model.Venta;
import TUSTORE.demo.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VentaService {
    @Autowired
    private VentaRepository ventaRepository;
    
    public List<Venta> findAll() {
        return ventaRepository.findAll();
    }
    
    public List<Venta> obtenerTodasLasVentas() {
        return ventaRepository.findAll();
    }
    
    public Optional<Venta> obtenerVentaPorId(Long id) {
        return ventaRepository.findById(id);
    }
    
    public Venta save(Venta venta) {
        return ventaRepository.save(venta);
    }
    
    public void deleteById(Long id) {
        ventaRepository.deleteById(id);
    }

    public Venta createVenta(Venta venta) {
        return ventaRepository.save(venta);
    }
    
    public boolean existsById(Long id) {
        return ventaRepository.existsById(id);
    }

    public List<Venta> findByUsuarioId(Long userId) {
        return ventaRepository.findByUsuarioId(userId);
    }

    public List<Venta> findByUsuarioIdAndFechaBetween(Long userId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findByUsuarioIdAndFechaBetween(userId, fechaInicio, fechaFin);
    }
    
    public List<Venta> obtenerUltimasVentas(int limite) {
        return ventaRepository.findAll(PageRequest.of(0, limite, Sort.by(Sort.Direction.DESC, "fecha"))).getContent();
    }
    
    public List<Venta> obtenerVentasPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findByFechaBetween(fechaInicio, fechaFin);
    }
}