import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "../components/sidebar";
import { Providers } from "../components/providers";

export const metadata: Metadata = {
  title: "SISTEMA DE INVENTARIOS - Sistema de Gestión de Inventario",
  description: "Gestión de inventario de grado industrial con analíticas en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="flex flex-col md:flex-row min-h-screen antialiased pb-20 md:pb-0">
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8" style={{ color: 'var(--text-primary)' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
