import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediLead AI – Healthcare Practice Intelligence",
  description:
    "AI-powered platform to identify, score, and reach Australian medical practices ready for automation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
