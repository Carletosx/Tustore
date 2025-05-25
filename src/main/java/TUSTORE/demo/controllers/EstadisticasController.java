package TUSTORE.demo.controllers;

import TUSTORE.demo.services.VentaService;
import TUSTORE.demo.model.Venta;
import TUSTORE.demo.model.DetalleVenta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/estadisticas")
public class EstadisticasController {

    @Autowired
    private VentaService ventaService;

    @GetMapping("/ventas/resumen")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getResumenVentas() {
        List<Venta> ventas = ventaService.obtenerTodasLasVentas();
        
        // Calcular ventas totales
        BigDecimal ventasTotales = ventas.stream()
                .map(venta -> venta.getDetalles().stream()
                        .map(detalle -> detalle.getPrecioUnitario().multiply(new BigDecimal(detalle.getCantidad())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calcular número de ventas
        long numeroVentas = ventas.size();

        // Calcular promedio de venta por transacción
        BigDecimal promedioVenta = numeroVentas > 0 ? 
            ventasTotales.divide(new BigDecimal(numeroVentas), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("ventasTotales", ventasTotales);
        resumen.put("numeroVentas", numeroVentas);
        resumen.put("promedioVenta", promedioVenta);

        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/productos/mas-vendidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getProductosMasVendidos() {
        List<Venta> ventas = ventaService.obtenerTodasLasVentas();

        Map<String, Integer> productosVendidos = ventas.stream()
                .flatMap(venta -> venta.getDetalles().stream())
                .collect(Collectors.groupingBy(
                        detalle -> detalle.getProducto().getNombre(),
                        Collectors.summingInt(DetalleVenta::getCantidad)
                ));

        // Ordenar por cantidad vendida y limitar a los 5 más vendidos
        List<Map.Entry<String, Integer>> top5Productos = productosVendidos.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(top5Productos);
    }

    @GetMapping("/ventas/por-periodo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVentasPorPeriodo(
            @RequestParam(required = false) String periodo) { // periodo puede ser: diario, semanal, mensual

        List<Venta> ventas = ventaService.obtenerTodasLasVentas();
        Map<String, BigDecimal> ventasPorPeriodo = new HashMap<>();

        // Agrupar ventas por el período especificado
        ventas.forEach(venta -> {
            LocalDateTime fecha = venta.getFecha();
            String key = periodo == null ? "total" :
                    periodo.equals("diario") ? fecha.toLocalDate().toString() :
                    periodo.equals("semanal") ? "Semana " + fecha.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear()) :
                    fecha.getMonth().toString() + " " + fecha.getYear();

            BigDecimal montoVenta = venta.getDetalles().stream()
                    .map(detalle -> detalle.getPrecioUnitario().multiply(new BigDecimal(detalle.getCantidad())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            ventasPorPeriodo.merge(key, montoVenta, BigDecimal::add);
        });

        return ResponseEntity.ok(ventasPorPeriodo);
    }
}