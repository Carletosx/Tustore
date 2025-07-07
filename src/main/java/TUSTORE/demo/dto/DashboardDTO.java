package TUSTORE.demo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardDTO {
    private ResumenVentasDTO resumenVentas;
    private List<ProductoMasVendidoDTO> productosMasVendidos;
    private List<CategoriaVentaDTO> categoriasMasVendidas;
    private List<ProductoStockCriticoDTO> productosStockCritico;
    private List<Map<String, Object>> ventasPorDia;
    private List<VentaRecienteDTO> ultimasVentas;

    @Data
    public static class ResumenVentasDTO {
        private long totalVentas;
        private BigDecimal montoTotal;
        private BigDecimal promedioVenta;
        private int alertasStock;
    }

    @Data
    public static class ProductoMasVendidoDTO {
        private Long id;
        private String nombre;
        private int cantidadVendida;
        private BigDecimal montoTotal;
    }

    @Data
    public static class CategoriaVentaDTO {
        private Long id;
        private String nombre;
        private int cantidadVendida;
        private BigDecimal montoTotal;
    }

    @Data
    public static class ProductoStockCriticoDTO {
        private Long id;
        private String nombre;
        private int stockActual;
        private int stockMinimo;
    }

    @Data
    public static class VentaRecienteDTO {
        private Long id;
        private String fecha;
        private BigDecimal total;
        private String metodoPago;
        private String numeroBoleta;
    }
}