import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Albumcito Facilito",
  description: "Colecciona los álbumes de Cody y controla tus estampas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
