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
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 10,
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomColor: '#000000',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f2f2f2',
    textAlign: 'center',
    padding: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const BoletaPDF = ({ cart, total }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Boleta de Venta</Text>
      <Text style={styles.subHeader}>Tu Tienda</Text>
      <Text style={styles.text}>Fecha: {new Date().toLocaleDateString()}</Text>
      <Text style={styles.text}>Hora: {new Date().toLocaleTimeString()}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Producto</Text>
          <Text style={styles.tableColHeader}>Cantidad</Text>
          <Text style={styles.tableColHeader}>Precio Unitario</Text>
          <Text style={styles.tableColHeader}>Subtotal</Text>
        </View>
        {cart.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCol}>{item.nombre}</Text>
            <Text style={styles.tableCol}>{item.quantity}</Text>
            <Text style={styles.tableCol}>S/. {item.precio.toFixed(2)}</Text>
            <Text style={styles.tableCol}>S/. {(item.quantity * item.precio).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: S/. {total.toFixed(2)}</Text>
      </View>
    </Page>
  </Document>
);

export default BoletaPDF;