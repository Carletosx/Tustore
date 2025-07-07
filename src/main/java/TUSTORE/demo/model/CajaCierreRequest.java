package TUSTORE.demo.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CajaCierreRequest {
    private BigDecimal efectivoFinal;
    private String observaciones;
    private String encargadoCierre;


}