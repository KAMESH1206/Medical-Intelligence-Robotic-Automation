import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MiraStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "MIRA Ops Intelligence – Healthcare Operations & Robotic Automation",
  description:
    "AI-powered healthcare data intelligence and robotic workflow automation SaaS platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#8DB9F0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#F8F8FC] antialiased">
        <MiraStoreProvider>{children}</MiraStoreProvider>
      </body>
    </html>
  );
}
