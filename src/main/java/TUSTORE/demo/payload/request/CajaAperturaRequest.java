package TUSTORE.demo.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class CajaAperturaRequest {
    @NotNull(message = "El efectivo inicial no puede ser nulo")
    private BigDecimal montoInicial;
    private String encargadoApertura;
    private Map<String, Integer> denominaciones;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime fechaApertura;
}