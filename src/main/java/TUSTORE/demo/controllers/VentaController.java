package TUSTORE.demo.controllers;

import TUSTORE.demo.model.DetalleVenta;
import TUSTORE.demo.model.Producto;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.model.Venta;
import TUSTORE.demo.model.Caja;
import TUSTORE.demo.payload.request.VentaRequest;
import TUSTORE.demo.repository.ProductoRepository;
import TUSTORE.demo.repository.UsuarioRepository;
import TUSTORE.demo.security.services.UserDetailsImpl;
import TUSTORE.demo.services.CajaService;
import TUSTORE.demo.services.VentaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CajaService cajaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> createVenta(@Valid @RequestBody VentaRequest ventaRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado."));

        Venta venta = new Venta();
        venta.setFecha(LocalDateTime.now());
        venta.setUsuario(usuario);
        venta.setAdmin(usuario); // Set the admin to the currently logged-in user
        venta.setMetodoPago(ventaRequest.getMetodoPago());
        System.out.println("Metodo de Pago recibido en VentaController: " + ventaRequest.getMetodoPago());
        System.out.println("Metodo de Pago establecido en Venta: " + venta.getMetodoPago());
        venta.setNumeroBoleta(ventaRequest.getNumeroBoleta());
        venta.setTipoComprobante(ventaRequest.getTipoComprobante());

        // Asociar la venta a la caja abierta
        Caja cajaAbierta = cajaService.getCajaAbierta(usuario.getId())
                .orElseThrow(() -> new IllegalStateException("No hay una caja abierta para este usuario. Por favor, abra una caja antes de realizar ventas."));
        venta.setCaja(cajaAbierta);

        Set<DetalleVenta> detallesVenta = new HashSet<>();
        BigDecimal totalVenta = BigDecimal.ZERO;

        for (TUSTORE.demo.payload.request.DetalleVentaRequest detalleRequest : ventaRequest.getDetalles()) {
            Optional<Producto> productoOptional = productoRepository.findById(detalleRequest.getProductoId());
            if (productoOptional.isEmpty()) {
                return new ResponseEntity<>("Producto con ID " + detalleRequest.getProductoId() + " no encontrado", HttpStatus.BAD_REQUEST);
            }
            Producto producto = productoOptional.get();

            if (producto.getStock() < detalleRequest.getCantidad()) {
                return new ResponseEntity<>("Stock insuficiente para el producto " + producto.getNombre(), HttpStatus.BAD_REQUEST);
            }

            DetalleVenta detalleVenta = new DetalleVenta();
            detalleVenta.setProducto(producto);
            detalleVenta.setCantidad(detalleRequest.getCantidad());
            detalleVenta.setPrecioUnitario(detalleRequest.getPrecioUnitario());
            detalleVenta.setVenta(venta);
            detallesVenta.add(detalleVenta);

            // Actualizar stock del producto
            producto.setStock(producto.getStock() - detalleRequest.getCantidad());
            productoRepository.save(producto);

            totalVenta = totalVenta.add(detalleRequest.getPrecioUnitario().multiply(new BigDecimal(detalleRequest.getCantidad())));
        }

        venta.setDetalles(detallesVenta);
        venta.setTotal(totalVenta);
        Venta nuevaVenta = ventaService.save(venta);
        System.out.println("Venta guardada con Metodo de Pago: " + nuevaVenta.getMetodoPago());

        return new ResponseEntity<>(nuevaVenta, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Venta>> getAllVentas() {
        List<Venta> ventas = ventaService.obtenerTodasLasVentas();
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<Venta> getVentaById(@PathVariable("id") Long id) {
        return ventaService.obtenerVentaPorId(id)
                .map(venta -> new ResponseEntity<>(venta, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteVenta(@PathVariable("id") Long id) {
        if (!ventaService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        ventaService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/usuario/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<List<Venta>> getVentasByUserId(@PathVariable("userId") Long userId) {
        List<Venta> ventas = ventaService.findByUsuarioId(userId);
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/rango-fechas/usuario/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<List<Venta>> getVentasByFechaBetween(
            @PathVariable("userId") Long userId,
            @RequestParam("fechaInicio") String fechaInicioStr,
            @RequestParam("fechaFin") String fechaFinStr) {
        LocalDateTime fechaInicio = LocalDateTime.parse(fechaInicioStr);
        LocalDateTime fechaFin = LocalDateTime.parse(fechaFinStr);
        List<Venta> ventas = ventaService.findByUsuarioIdAndFechaBetween(userId, fechaInicio, fechaFin);
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }
}