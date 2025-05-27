import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from './authRoutes';
import Toast from '../components/Toast';
import { useState } from 'react';

const PrivateRoute = ({ children, requiredRole }) => {
  const [toast, setToast] = useState(null);

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && !hasRole(requiredRole) && !hasRole('ROLE_ADMIN')) {
    setToast({
      message: 'No tienes permiso para acceder a esta sección',
      type: 'error'
    });
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default PrivateRoute;