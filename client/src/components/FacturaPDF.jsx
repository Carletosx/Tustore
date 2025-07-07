import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  description: {
    width: '60%',
  },
  qty: {
    width: '10%',
    textAlign: 'right',
  },
  price: {
    width: '15%',
    textAlign: 'right',
  },
  total: {
    width: '15%',
    textAlign: 'right',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  totalText: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    textAlign: 'center',
    color: 'grey',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
});

const FacturaPDF = ({ cart, total, facturaNumber, cashierName, amountPaid, change, paymentMethod, clientName, clientDoc, clientAddress }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>FACTURA DE VENTA</Text>
      </View>

      <View style={styles.section}>
        <Text>Número de Factura: {facturaNumber}</Text>
        <Text>Fecha: {new Date().toLocaleDateString()}</Text>
        <Text>Cajero: {cashierName}</Text>
      </View>

      <View style={styles.section}>
        <Text>Información del Cliente:</Text>
        <Text>Nombre: {clientName}</Text>
        <Text>RUC/DNI: {clientDoc}</Text>
        <Text>Dirección: {clientAddress}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.tableHeader}>
          <Text style={styles.description}>Producto</Text>
          <Text style={styles.qty}>Cant.</Text>
          <Text style={styles.price}>P. Unit.</Text>
          <Text style={styles.total}>Total</Text>
        </View>
        {cart.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.description}>{item.nombre}</Text>
            <Text style={styles.qty}>{item.quantity}</Text>
            <Text style={styles.price}>S/ {item.precio.toFixed(2)}</Text>
            <Text style={styles.total}>S/ {(item.quantity * item.precio).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>SUBTOTAL:</Text>
          <Text>S/ {(total / 1.18).toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>IGV (18%):</Text>
          <Text>S/ {(total - (total / 1.18)).toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>TOTAL:</Text>
          <Text>S/ {total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text>Método de Pago: {paymentMethod}</Text>
        {paymentMethod === 'Efectivo' && (
          <>
            <Text>Monto Recibido: S/ {amountPaid.toFixed(2)}</Text>
            <Text>Vuelto: S/ {change.toFixed(2)}</Text>
          </>
        )}
      </View>

      <Text style={styles.footer}>
        ¡Gracias por su compra!
      </Text>
    </Page>
  </Document>
);

export default FacturaPDF;