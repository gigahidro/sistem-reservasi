import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PTIK YUMFOOD — Sistem Reservasi Restoran",
  description:
    "Reservasi meja restoran PTIK YUMFOOD dengan mudah dan cepat. Pilih outlet, sesi, dan meja favorit Anda.",
  keywords: ["reservasi restoran", "PTIK YUMFOOD", "booking meja", "kuliner"],
  openGraph: {
    title: "PTIK YUMFOOD — Sistem Reservasi Restoran",
    description: "Reservasi meja dengan mudah di PTIK YUMFOOD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
