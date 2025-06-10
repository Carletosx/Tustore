package TUSTORE.demo.services;

import TUSTORE.demo.model.Venta;
import TUSTORE.demo.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    public boolean existsById(Long id) {
        return ventaRepository.existsById(id);
    }

    public List<Venta> findByUsuarioId(Long userId) {
        return ventaRepository.findByUsuarioId(userId);
    }

    public List<Venta> findByUsuarioIdAndFechaBetween(Long userId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findByUsuarioIdAndFechaBetween(userId, fechaInicio, fechaFin);
    }
}