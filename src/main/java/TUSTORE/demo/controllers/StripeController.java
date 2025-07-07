package TUSTORE.demo.controllers;

import TUSTORE.demo.model.DetalleVenta;
import TUSTORE.demo.services.StripeService;
import TUSTORE.demo.repository.ProductoRepository;
import com.stripe.model.Event;

import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;

import TUSTORE.demo.model.DetalleVenta;
import TUSTORE.demo.services.StripeService;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {

    private static final Logger logger = LoggerFactory.getLogger(StripeController.class);

    @Autowired
    private StripeService stripeService;
    
    @Autowired
    private ProductoRepository productoRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/create-checkout-session")
    @SuppressWarnings("unchecked")
    public ResponseEntity<String> createCheckoutSession(@RequestBody Map<String, Object> data) {
        logger.info("Received request to create checkout session. Data: {}", data);
        try {
            List<Map<String, Object>> detalles = (List<Map<String, Object>>) data.get("detalles");
            String tipoComprobante = (String) data.get("tipoComprobante");
            Map<String, String> clientData = (Map<String, String>) data.get("clientData");

            List<DetalleVenta> detalleVentas = detalles.stream().map(detalle -> {
                DetalleVenta dv = new DetalleVenta();
                logger.debug("Processing detalle: {}", detalle);

                dv.setCantidad(Integer.valueOf(detalle.get("cantidad").toString()));
                dv.setPrecioUnitario(new BigDecimal(detalle.get("precioUnitario").toString()));
                Long productoId = Long.valueOf(detalle.get("productoId").toString());
                dv.setProducto(productoRepository.findById(productoId).orElseThrow());
                return dv;
            }).collect(Collectors.toList());

            logger.info("Mapped {} DetalleVenta objects. Calling StripeService.", detalleVentas.size());
            String sessionUrl = stripeService.createCheckoutSession(detalleVentas, tipoComprobante, clientData);
            logger.info("Stripe session URL created: {}", sessionUrl);
            return ResponseEntity.ok(sessionUrl);
        } catch (StripeException e) {
            logger.error("Error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating checkout session: " + e.getMessage());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhookEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // Eliminar la verificación duplicada y delegar toda la lógica al servicio
            stripeService.handleWebhookEvent(payload, sigHeader);
            return ResponseEntity.ok("Webhook handled");
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error handling webhook: " + e.getMessage());
        }
    }
}