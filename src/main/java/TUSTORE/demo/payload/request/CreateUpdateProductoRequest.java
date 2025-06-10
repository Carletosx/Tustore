package TUSTORE.demo.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateUpdateProductoRequest {
    @NotBlank
    @Size(max = 100)
    private String nombre;

    @Size(max = 500)
    private String descripcion;

    @NotNull
    private BigDecimal precio;

    @NotNull
    private Integer stock;

    private String imagenBase64;

    @NotNull
    private Long categoriaId;
}