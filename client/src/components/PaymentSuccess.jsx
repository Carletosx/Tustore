import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#4CAF50', fontSize: '3em' }}>¡Pago Exitoso!</h1>
      <p style={{ fontSize: '1.2em', color: '#555' }}>Tu pago ha sido procesado correctamente.</p>
      <Link to="/pos" style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontSize: '1em'
      }}>
        Volver al Punto de Venta
      </Link>
    </div>
  );
};

export default PaymentSuccess;