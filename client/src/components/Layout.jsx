import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Toast from './Toast';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ROLE_ADMIN'] },
    { path: '/pos', label: 'Punto de Venta', icon: '💰', roles: ['ROLE_ADMIN', 'ROLE_CASHIER'] },
    { path: '/productos', label: 'Productos', icon: '📦', roles: ['ROLE_ADMIN'] },
    { path: '/inventario', label: 'Inventario', icon: '🗃️', roles: ['ROLE_ADMIN', 'ROLE_STOREKEEPER'] },
    { path: '/reportes', label: 'Reportes', icon: '📈', roles: ['ROLE_ADMIN'] },
    { path: '/configuracion', label: 'Configuración', icon: '⚙️', roles: ['ROLE_ADMIN'] },
  ];

  const handleNavigation = (path, allowedRoles) => {
    if (!user) return;

    const hasPermission = user.roles.some(role => allowedRoles.includes(role));
    
    if (!hasPermission) {
      setToast({
        message: 'Acceso denegado: no tienes permiso para ver esta sección.',
        type: 'error'
      });
      return;
    }

    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">TuStore</h2>
          <p className="text-sm text-gray-600 mt-1">{user?.username}</p>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.roles)}
              className={`w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${location.pathname === item.path ? 'bg-gray-100' : ''}`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <span className="mr-3">🚪</span>
            Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {children}
      </div>
    </div>
  );
};

export default Layout;