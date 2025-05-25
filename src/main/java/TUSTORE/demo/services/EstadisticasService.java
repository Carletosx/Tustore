package TUSTORE.demo.services;

import TUSTORE.demo.model.Venta;
import TUSTORE.demo.model.DetalleVenta;
import TUSTORE.demo.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class EstadisticasService {

    @Autowired
    private VentaRepository ventaRepository;

    public Map<String, Object> obtenerResumenVentas() {
        List<Venta> ventas = ventaRepository.findAll();
        
        BigDecimal ventasTotales = calcularVentasTotales(ventas);
        long numeroVentas = ventas.size();
        BigDecimal promedioVenta = numeroVentas > 0 ? 
            ventasTotales.divide(new BigDecimal(numeroVentas), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("ventasTotales", ventasTotales);
        resumen.put("numeroVentas", numeroVentas);
        resumen.put("promedioVenta", promedioVenta);

        return resumen;
    }

    public List<Map.Entry<String, Integer>> obtenerProductosMasVendidos() {
        List<Venta> ventas = ventaRepository.findAll();

        Map<String, Integer> productosVendidos = ventas.stream()
                .flatMap(venta -> venta.getDetalles().stream())
                .collect(Collectors.groupingBy(
                        detalle -> detalle.getProducto().getNombre(),
                        Collectors.summingInt(DetalleVenta::getCantidad)
                ));

        return productosVendidos.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    public Map<String, BigDecimal> obtenerVentasPorPeriodo(String periodo) {
        List<Venta> ventas = ventaRepository.findAll();
        Map<String, BigDecimal> ventasPorPeriodo = new HashMap<>();

        ventas.forEach(venta -> {
            LocalDateTime fecha = venta.getFecha();
            String key = periodo == null ? "total" :
                    periodo.equals("diario") ? fecha.toLocalDate().toString() :
                    periodo.equals("semanal") ? "Semana " + fecha.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear()) :
                    fecha.getMonth().toString() + " " + fecha.getYear();

            BigDecimal montoVenta = calcularMontoVenta(venta);
            ventasPorPeriodo.merge(key, montoVenta, BigDecimal::add);
        });

        return ventasPorPeriodo;
    }

    private BigDecimal calcularVentasTotales(List<Venta> ventas) {
        return ventas.stream()
                .map(this::calcularMontoVenta)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularMontoVenta(Venta venta) {
        return venta.getDetalles().stream()
                .map(detalle -> detalle.getPrecioUnitario().multiply(new BigDecimal(detalle.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}