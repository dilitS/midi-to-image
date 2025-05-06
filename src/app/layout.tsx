import { Inter } from "next/font/google";
import "./globals.css";
import ClientContent from "@/components/layout/ClientContent";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MIDI to Image",
  description: "Transform your MIDI melodies into AI-generated images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientContent>
          {children}
        </ClientContent>
      </body>
    </html>
  );
}
