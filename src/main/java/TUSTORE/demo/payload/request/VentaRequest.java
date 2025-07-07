package TUSTORE.demo.payload.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class VentaRequest {
    @Valid
    @NotEmpty(message = "Los detalles de la venta no pueden estar vacíos")
    private List<DetalleVentaRequest> detalles;

    private String metodoPago;
    private String numeroBoleta;
    private String tipoComprobante;

    public List<DetalleVentaRequest> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVentaRequest> detalles) {
        this.detalles = detalles;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getNumeroBoleta() {
        return numeroBoleta;
    }

    public void setNumeroBoleta(String numeroBoleta) {
        this.numeroBoleta = numeroBoleta;
    }

    public String getTipoComprobante() {
        return tipoComprobante;
    }

    public void setTipoComprobante(String tipoComprobante) {
        this.tipoComprobante = tipoComprobante;
    }
}