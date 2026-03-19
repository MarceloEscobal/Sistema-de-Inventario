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
      <body className="flex min-h-screen antialiased">
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8" style={{ color: 'var(--text-primary)' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
