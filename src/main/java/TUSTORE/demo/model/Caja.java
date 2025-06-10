package TUSTORE.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cajas")
public class Caja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "encargado_apertura")
    private String encargadoApertura;

    @ElementCollection
    @CollectionTable(name = "caja_denominaciones", joinColumns = @JoinColumn(name = "caja_id"))
    @MapKeyColumn(name = "denominacion_key")
    @Column(name = "denominacion_value")
    private Map<String, Integer> denominaciones;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "efectivo_inicial", nullable = false)
    private BigDecimal efectivoInicial;

    @Column(name = "efectivo_final")
    private BigDecimal efectivoFinal;

    @Column(name = "total_ventas")
    private BigDecimal totalVentas;

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    @Column(name = "encargado_cierre")
    private String encargadoCierre;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoCaja estado;

    public enum EstadoCaja {
        ABIERTA,
        CERRADA
    }

    // Desglose de efectivo inicial (opcional, se puede manejar en un JSON o tabla separada si es muy detallado)
    // Por simplicidad, lo mantendré como un campo único por ahora, o se puede añadir un JSONB si la DB lo soporta.


}