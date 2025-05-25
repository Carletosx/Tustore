'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Panel de Administración</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="/admin/productos" className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-500">
                  Productos
                </a>
                <a href="/admin/categorias" className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-500">
                  Categorías
                </a>
                <a href="/admin/usuarios" className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-500">
                  Usuarios
                </a>
                <a href="/admin/ventas" className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-500">
                  Ventas
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}