package TUSTORE.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ventas")
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "fecha")
    private LocalDateTime fecha;



    @NotNull
    @Column(name = "total")
    private BigDecimal total;
    @NotNull
    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "numero_boleta")
    private String numeroBoleta;

    @Column(name = "cliente_nombre")
    private String clienteNombre;

    @Column(name = "cliente_documento")
    private String clienteDocumento;

    @Column(name = "cliente_direccion")
    private String clienteDireccion;

    @NotNull
    @Column(name = "tipo_comprobante")
    private String tipoComprobante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Usuario admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caja_id")
    private Caja caja;

        @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DetalleVenta> detalles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        fecha = LocalDateTime.now();
    }

    public void calcularTotal() {
        total = detalles.stream()
                .map(detalle -> detalle.getPrecioUnitario().multiply(new BigDecimal(detalle.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addDetalle(DetalleVenta detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }

    public void removeDetalle(DetalleVenta detalle) {
        detalles.remove(detalle);
        detalle.setVenta(null);
    }
}