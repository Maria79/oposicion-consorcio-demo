import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Oposición Auxiliar Administrativo - Consorcio de Tributos de Tenerife",
  description:
    "Plataforma de estudio para la oposición de Auxiliar Administrativo del Consorcio de Tributos de Tenerife - 36 plazas Grupo C2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
