package TUSTORE.demo.services;

import TUSTORE.demo.dto.DashboardDTO;
import TUSTORE.demo.model.Venta;
import TUSTORE.demo.model.DetalleVenta;
import TUSTORE.demo.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class EstadisticasService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoService productoService;

    public DashboardDTO obtenerDashboardData() {
        DashboardDTO dashboard = new DashboardDTO();
        List<Venta> ventas = ventaRepository.findAll();

        // Resumen de ventas
        dashboard.setResumenVentas(obtenerResumenVentas(ventas));

        // Productos más vendidos
        dashboard.setProductosMasVendidos(obtenerProductosMasVendidos(ventas));

        // Categorías más vendidas
        dashboard.setCategoriasMasVendidas(obtenerCategoriasMasVendidas(ventas));

        // Productos con stock crítico
        dashboard.setProductosStockCritico(obtenerProductosStockCritico(5));

        // Ventas por día (últimos 7 días)
        dashboard.setVentasPorDia(obtenerVentasUltimosDias(7));

        // Últimas ventas
        dashboard.setUltimasVentas(obtenerUltimasVentas(10));

        return dashboard;
    }

    private DashboardDTO.ResumenVentasDTO obtenerResumenVentas(List<Venta> ventas) {
        DashboardDTO.ResumenVentasDTO resumen = new DashboardDTO.ResumenVentasDTO();
        
        BigDecimal montoTotal = calcularVentasTotales(ventas);

        resumen.setTotalVentas(ventas.size());
        resumen.setMontoTotal(montoTotal);
        resumen.setPromedioVenta(ventas.isEmpty() ? BigDecimal.ZERO :
                montoTotal.divide(new BigDecimal(ventas.size()), 2, RoundingMode.HALF_UP));
        resumen.setAlertasStock(productoService.obtenerProductosConStockBajo(5).size());

        return resumen;
    }

    private List<DashboardDTO.ProductoMasVendidoDTO> obtenerProductosMasVendidos(List<Venta> ventas) {
        Map<Long, DashboardDTO.ProductoMasVendidoDTO> productosMap = new HashMap<>();

        ventas.stream()
                .flatMap(venta -> venta.getDetalles().stream())
                .forEach(detalle -> {
                    Long productoId = detalle.getProducto().getId();
                    productosMap.computeIfAbsent(productoId, k -> {
                        DashboardDTO.ProductoMasVendidoDTO dto = new DashboardDTO.ProductoMasVendidoDTO();
                        dto.setId(productoId);
                        dto.setNombre(detalle.getProducto().getNombre());
                        dto.setMontoTotal(BigDecimal.ZERO);
                        dto.setCantidadVendida(0);
                        return dto;
                    });
                    DashboardDTO.ProductoMasVendidoDTO dto = productosMap.get(productoId);
                    dto.setCantidadVendida(dto.getCantidadVendida() + detalle.getCantidad());
                    BigDecimal montoDetalle = detalle.getPrecioUnitario().multiply(new BigDecimal(detalle.getCantidad()));
                    dto.setMontoTotal(dto.getMontoTotal().add(montoDetalle));
                });

        return productosMap.values().stream()
                .sorted((p1, p2) -> p2.getCantidadVendida() - p1.getCantidadVendida())
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<DashboardDTO.CategoriaVentaDTO> obtenerCategoriasMasVendidas(List<Venta> ventas) {
        Map<Long, DashboardDTO.CategoriaVentaDTO> categoriasMap = new HashMap<>();

        ventas.stream()
                .flatMap(venta -> venta.getDetalles().stream())
                .forEach(detalle -> {
                    Long categoriaId = detalle.getProducto().getCategoria().getId();
                    categoriasMap.computeIfAbsent(categoriaId, k -> {
                        DashboardDTO.CategoriaVentaDTO dto = new DashboardDTO.CategoriaVentaDTO();
                        dto.setId(categoriaId);
                        dto.setNombre(detalle.getProducto().getCategoria().getNombre());
                        dto.setMontoTotal(BigDecimal.ZERO);
                        dto.setCantidadVendida(0);
                        return dto;
                    });
                    DashboardDTO.CategoriaVentaDTO dto = categoriasMap.get(categoriaId);
                    dto.setCantidadVendida(dto.getCantidadVendida() + detalle.getCantidad());
                    BigDecimal montoDetalle = detalle.getPrecioUnitario().multiply(new BigDecimal(detalle.getCantidad()));
                    dto.setMontoTotal(dto.getMontoTotal().add(montoDetalle));
                });

        return categoriasMap.values().stream()
                .sorted((c1, c2) -> c2.getCantidadVendida() - c1.getCantidadVendida())
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<DashboardDTO.ProductoStockCriticoDTO> obtenerProductosStockCritico(int stockMinimo) {
        return productoService.obtenerProductosConStockBajo(stockMinimo).stream()
                .map(producto -> {
                    DashboardDTO.ProductoStockCriticoDTO dto = new DashboardDTO.ProductoStockCriticoDTO();
                    dto.setId(producto.getId());
                    dto.setNombre(producto.getNombre());
                    dto.setStockActual(producto.getStock());
                    dto.setStockMinimo(stockMinimo);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> obtenerVentasUltimosDias(int dias) {
        LocalDate fechaFin = LocalDate.now();
        LocalDate fechaInicio = fechaFin.minusDays(dias - 1);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        Map<String, BigDecimal> ventasPorDia = new LinkedHashMap<>();
        
        // Inicializar todos los días con valor cero
        for (int i = 0; i < dias; i++) {
            LocalDate fecha = fechaInicio.plusDays(i);
            ventasPorDia.put(fecha.format(formatter), BigDecimal.ZERO);
        }
        
        // Calcular ventas por día
        ventaRepository.findAll().stream()
                .filter(venta -> {
                    LocalDate fechaVenta = venta.getFecha().toLocalDate();
                    return !fechaVenta.isBefore(fechaInicio) && !fechaVenta.isAfter(fechaFin);
                })
                .forEach(venta -> {
                    String fechaKey = venta.getFecha().toLocalDate().format(formatter);
                    ventasPorDia.merge(fechaKey, venta.getTotal(), BigDecimal::add);
                });
        
        return ventasPorDia.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> ventaDia = new HashMap<>();
                    ventaDia.put("fecha", entry.getKey());
                    ventaDia.put("total", entry.getValue());
                    return ventaDia;
                })
                .collect(Collectors.toList());
    }

    private List<DashboardDTO.VentaRecienteDTO> obtenerUltimasVentas(int limite) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return ventaRepository.findAll().stream()
                .sorted((v1, v2) -> v2.getFecha().compareTo(v1.getFecha()))
                .limit(limite)
                .map(venta -> {
                    DashboardDTO.VentaRecienteDTO dto = new DashboardDTO.VentaRecienteDTO();
                    dto.setId(venta.getId());
                    dto.setFecha(venta.getFecha().format(formatter));
                    dto.setTotal(venta.getTotal());
                    dto.setMetodoPago(venta.getMetodoPago());
                    dto.setNumeroBoleta(venta.getNumeroBoleta());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private BigDecimal calcularVentasTotales(List<Venta> ventas) {
        return ventas.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}