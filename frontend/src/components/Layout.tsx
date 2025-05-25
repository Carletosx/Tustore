'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Mi tienda', path: '/tienda', icon: '🏪' },
    { name: 'Configuraciones', path: '/configuraciones', icon: '⚙️' },
    { name: 'Vender', path: '/vender', icon: '💰' },
    { name: 'Movimientos', path: '/movimientos', icon: '📊' },
    { name: 'Estadísticas', path: '/estadisticas', icon: '📈' },
    { name: 'Inventario', path: '/inventario', icon: '📦' },
    { name: 'Empleados', path: '/admin/usuarios', icon: '👥' },
    { name: 'Clientes', path: '/clientes', icon: '🤝' },
    { name: 'Proveedores', path: '/proveedores', icon: '🚚' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra lateral */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Tu Store</h1>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${pathname === item.path ? 'bg-gray-50 border-l-4 border-indigo-500' : ''}`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}