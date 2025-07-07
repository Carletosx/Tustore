package TUSTORE.demo.services;

import TUSTORE.demo.model.Caja;
import TUSTORE.demo.model.Venta;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.repository.CajaRepository;
import TUSTORE.demo.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CajaService {

    @Autowired
    private CajaRepository cajaRepository;

    @Autowired
    private VentaRepository ventaRepository;

    public Caja abrirCaja(Usuario usuario, BigDecimal montoInicial, String encargadoApertura, Map<String, Integer> denominaciones, LocalDateTime fechaApertura) {
        // Verificar si ya existe una caja abierta para este usuario
        Optional<Caja> cajaAbierta = cajaRepository.findByUsuarioIdAndEstado(usuario.getId(), Caja.EstadoCaja.ABIERTA);
        if (cajaAbierta.isPresent()) {
            throw new IllegalStateException("Ya existe una caja abierta para este usuario.");
        }

        Caja caja = new Caja();
        caja.setUsuario(usuario);
        caja.setEfectivoInicial(montoInicial);
        caja.setEncargadoApertura(encargadoApertura);
        caja.setDenominaciones(denominaciones);
        caja.setFechaApertura(fechaApertura);
        caja.setEstado(Caja.EstadoCaja.ABIERTA);
        return cajaRepository.save(caja);
    }

    @Transactional
    public Caja cerrarCaja(Usuario usuario, BigDecimal efectivoFinal, String observaciones, String encargadoCierre) {
        Caja caja = cajaRepository.findByUsuarioAndEstado(usuario, Caja.EstadoCaja.ABIERTA)
                 .orElseThrow(() -> new IllegalStateException("No hay caja abierta para este usuario."));

        // Calcular el total de ventas asociadas a esta caja
        BigDecimal totalVentas = ventaRepository.findByCajaId(caja.getId()).stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        caja.setFechaCierre(LocalDateTime.now());
        caja.setEfectivoFinal(efectivoFinal);
        caja.setTotalVentas(totalVentas);
        caja.setEstado(Caja.EstadoCaja.CERRADA);
        caja.setObservaciones(observaciones);
        caja.setEncargadoCierre(encargadoCierre);
        System.out.println("Caja antes de guardar: " + caja.getId() + ", Estado: " + caja.getEstado() + ", Efectivo Final: " + caja.getEfectivoFinal());
        Caja cajaGuardada = cajaRepository.save(caja);
        System.out.println("Caja guardada: " + cajaGuardada.getId() + ", Estado: " + cajaGuardada.getEstado());
        return cajaGuardada;
    }

    public Optional<Caja> getCajaAbierta(Long usuarioId) {
        return cajaRepository.findByUsuarioIdAndEstado(usuarioId, Caja.EstadoCaja.ABIERTA);
    }

    public Map<String, Object> getResumenCaja(Long usuarioId) {
        Caja caja = cajaRepository.findByUsuarioIdAndEstado(usuarioId, Caja.EstadoCaja.ABIERTA)
                .orElseThrow(() -> new IllegalStateException("No hay caja abierta para este usuario."));

        List<Venta> ventasCaja = ventaRepository.findByCajaId(caja.getId());

        BigDecimal totalVentas = ventasCaja.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> desgloseMetodoPago = ventasCaja.stream()
                .filter(venta -> venta.getMetodoPago() != null)
                .collect(Collectors.groupingBy(Venta::getMetodoPago,
                        Collectors.reducing(BigDecimal.ZERO, Venta::getTotal, BigDecimal::add)));

        return Map.of(
                "cajaId", caja.getId(),
                "fechaApertura", caja.getFechaApertura(),
                "efectivoInicial", caja.getEfectivoInicial(),
                "totalVentas", totalVentas,
                "desgloseMetodoPago", desgloseMetodoPago
        );
    }

    public List<Caja> getHistorialCajas(Long usuarioId) {
        return cajaRepository.findByUsuarioIdOrderByFechaAperturaDesc(usuarioId);
    }
}