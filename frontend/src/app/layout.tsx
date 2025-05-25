import type { Metadata } from "next";
import "./globals.css";
import Layout from '@/components/Layout';

// Eliminamos la importación de Google Fonts y usamos fuentes del sistema

export const metadata: Metadata = {
  title: "Tu Store - Sistema de Gestión",
  description: "Sistema de gestión para tu tienda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans"> {/* Usamos la clase font-sans de Tailwind */}
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
