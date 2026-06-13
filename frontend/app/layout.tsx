import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppLayout } from "@/components/layout/AppLayout";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Phone Number Generator",
  description:
    "Generate format-valid mobile phone numbers for 30 countries at scale (5M–20M per job)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
