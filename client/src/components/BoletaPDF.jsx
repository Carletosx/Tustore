import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555555',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
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
  description: {
    width: '40%',
  },
  qty: {
    width: '20%',
    textAlign: 'right',
  },
  price: {
    width: '20%',
    textAlign: 'right',
  },
  total: {
    width: '20%',
    textAlign: 'right',
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
  separator: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
  },
  thankYou: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const BoletaPDF = ({ cart, total, boletaNumber, cashierName, amountPaid, change, paymentMethod, tipoComprobante }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>TuStore - Minimarket Digital</Text>
      <Text style={styles.subHeader}>RUC: 12345678900</Text>
      <Text style={styles.subHeader}>Av. Los Próceres 123, Surco</Text>
      <Text style={styles.subHeader}>Tel: 987654321 - ventas@tustore.pe</Text>
      <Text style={styles.text}>{tipoComprobante} N°: {boletaNumber}</Text>
      <Text style={styles.text}>Fecha: {new Date().toLocaleDateString()}   Hora: {new Date().toLocaleTimeString()}</Text>
      <Text style={styles.text}>Cajero: {cashierName}</Text>
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
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>TOTAL A PAGAR:</Text>
        <Text>S/ {total.toFixed(2)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>PAGO:</Text>
        <Text>S/ {amountPaid.toFixed(2)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>VUELTO:</Text>
        <Text>S/ {change.toFixed(2)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>FORMA DE PAGO:</Text>
        <Text>{paymentMethod}</Text>
      </View>
      <Text style={styles.thankYou}>Gracias por su preferencia</Text>
    </Page>
  </Document>
);

export default BoletaPDF;