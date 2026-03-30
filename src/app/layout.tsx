import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import SocketProvider from "@/providers/SocketProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MARKIT | Every Thing You Need",
  description:
    "A curated selection of industrial essentials, engineered for the modern workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fef9f1] text-[#1d1c17]">
        <SocketProvider>{children}</SocketProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1d1c17",
              color: "#fef9f1",
              border: "1px solid #2A2A2A",
              borderRadius: "2px",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
