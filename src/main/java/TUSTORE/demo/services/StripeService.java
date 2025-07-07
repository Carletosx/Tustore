package TUSTORE.demo.services;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.model.Event;
import com.stripe.model.LineItem;
import com.stripe.model.LineItemCollection;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionListLineItemsParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import TUSTORE.demo.model.Venta;
import TUSTORE.demo.model.DetalleVenta;
import TUSTORE.demo.model.Producto;
import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.repository.VentaRepository;
import TUSTORE.demo.repository.ProductoRepository;
import TUSTORE.demo.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class StripeService {

    private static final Logger logger = LoggerFactory.getLogger(StripeService.class);

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.success.url}")
    private String successUrl;

    @Value("${stripe.cancel.url}")
    private String cancelUrl;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public StripeService() {
    }

    public String createCheckoutSession(List<TUSTORE.demo.model.DetalleVenta> detalles, String tipoComprobante, Map<String, String> clientData) throws StripeException {
        Stripe.apiKey = stripeSecretKey;
    
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
    
        for (TUSTORE.demo.model.DetalleVenta detalle : detalles) {
            SessionCreateParams.LineItem.PriceData.ProductData productData =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(detalle.getProducto().getNombre())
                            .putMetadata("productoId", detalle.getProducto().getId().toString())
                            .build();
            
            SessionCreateParams.LineItem.PriceData priceData = SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency("pen")
                    .setUnitAmount(detalle.getPrecioUnitario().multiply(new BigDecimal(100)).longValue())
                    .setProductData(productData)
                    .build();
    
            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity(Long.valueOf(detalle.getCantidad()))
                    .setPriceData(priceData)
                    .build();
    
            lineItems.add(lineItem);
        }
    
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addAllLineItem(lineItems)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD);
    
        if (clientData != null) {
            paramsBuilder.setCustomerEmail(clientData.get("clientDoc"));
            paramsBuilder.putMetadata("tipoComprobante", tipoComprobante);
            paramsBuilder.putMetadata("clientName", clientData.get("clientName"));
            paramsBuilder.putMetadata("clientDoc", clientData.get("clientDoc"));
            paramsBuilder.putMetadata("clientAddress", clientData.get("clientAddress"));
        }
    
        Session session = Session.create(paramsBuilder.build());
    
        return session.getUrl();
    }

    public void handleWebhookEvent(String payload, String sigHeader) throws StripeException {
        Event event;
        logger.info("Procesando evento webhook de Stripe");

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            logger.info("Evento webhook construido exitosamente. Tipo: {}", event.getType());
        } catch (com.stripe.exception.SignatureVerificationException e) {
            logger.error("Error validando la firma del webhook: {}", e.getMessage());
            throw new com.stripe.exception.ApiException("Error validando la firma del webhook", null, null, null, null);
        } catch (Exception e) {
            logger.error("Error procesando el webhook: {}", e.getMessage());
            throw new com.stripe.exception.ApiException("Error procesando el webhook", null, null, null, null);
        }

        if ("checkout.session.completed".equals(event.getType())) {
            logger.info("Procesando evento checkout.session.completed");
            Session session = (Session) event.getDataObjectDeserializer().getObject().get();
            handleSuccessfulPayment(session);
            logger.info("Pago procesado exitosamente");
        } else {
            logger.info("Evento ignorado: {}", event.getType());
        }
    }

    @Transactional
    private void handleSuccessfulPayment(Session session) throws StripeException {
        logger.info("Iniciando procesamiento de pago exitoso. Session ID: {}", session.getId());
        Map<String, String> metadata = session.getMetadata();
        String tipoComprobante = metadata.get("tipoComprobante");
        logger.info("Tipo de comprobante: {}", tipoComprobante);
    
        Venta venta = new Venta();
        venta.setFecha(LocalDateTime.now());
        venta.setTotal(BigDecimal.valueOf(session.getAmountTotal() / 100.0));
        venta.setMetodoPago("Tarjeta");
        venta.setTipoComprobante(tipoComprobante);
        venta.setDetalles(new java.util.HashSet<>()); // Inicializar el Set de detalles
        
        // Asignar un admin por defecto (el primer usuario encontrado)
        Usuario admin = usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró ningún usuario en el sistema"));
        venta.setAdmin(admin);
    
        if ("Factura".equals(tipoComprobante)) {
            venta.setClienteNombre(metadata.get("clientName"));
            venta.setClienteDocumento(metadata.get("clientDoc"));
        }
    
        try {
            // Procesar los detalles de la venta
            SessionListLineItemsParams params = SessionListLineItemsParams.builder()
                    .setLimit(100L)
                    .addExpand("data.price.product")
                    .build();
            LineItemCollection lineItems = session.listLineItems(params);
            logger.info("Número de line items recuperados: {}", lineItems.getData().size());
    
            for (LineItem item : lineItems.getData()) {
                logger.info("Procesando LineItem: Cantidad = {}", item.getQuantity());
                DetalleVenta detalle = new DetalleVenta();
                detalle.setVenta(venta);
                detalle.setCantidad(item.getQuantity().intValue());
                detalle.setPrecioUnitario(BigDecimal.valueOf(item.getPrice().getUnitAmount() / 100.0));
                
                // Obtener el producto y actualizar stock
                String productoId = item.getPrice().getProductObject().getMetadata().get("productoId");
                
                if (productoId == null) {
                    logger.error("No se encontró el ID del producto en los metadatos del producto");
                    throw new RuntimeException("ID del producto no encontrado en los metadatos");
                }
                
                logger.info("ID del producto encontrado: {}", productoId);
                
                Producto producto = productoRepository.findById(Long.parseLong(productoId))
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + productoId));
                
                detalle.setProducto(producto);
                venta.getDetalles().add(detalle);
                
                // Actualizar stock
                int nuevoStock = producto.getStock() - detalle.getCantidad();
                if (nuevoStock < 0) {
                    logger.error("Stock insuficiente para el producto {}", productoId);
                    throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
                }
                
                producto.setStock(nuevoStock);
                productoRepository.save(producto);
                logger.info("Stock actualizado para producto {}: nuevo stock {}", productoId, nuevoStock);
            }
    
            logger.info("Intentando guardar venta con {} detalles", venta.getDetalles().size());
            logger.info("Admin asignado: {}", venta.getAdmin().getUsername());
            logger.info("Total de la venta: {}", venta.getTotal());
            
            Venta ventaGuardada = ventaRepository.save(venta);
            logger.info("Venta guardada exitosamente con ID: {}", ventaGuardada.getId());
            
            // Verificar que los detalles también se guardaron
            logger.info("Detalles guardados: {}", ventaGuardada.getDetalles().size());
            
        } catch (Exception e) {
            logger.error("Error procesando el pago: {}", e.getMessage(), e);
            throw new RuntimeException("Error procesando el pago: " + e.getMessage());
        }
    }
}