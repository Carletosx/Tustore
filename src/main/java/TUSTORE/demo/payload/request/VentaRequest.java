package TUSTORE.demo.payload.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class VentaRequest {
    @Valid
    @NotEmpty(message = "Los detalles de la venta no pueden estar vacíos")
    private List<DetalleVentaRequest> detalles;

    public List<DetalleVentaRequest> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVentaRequest> detalles) {
        this.detalles = detalles;
    }
}