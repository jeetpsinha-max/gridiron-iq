import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GridironIQ | AI-Powered Football Film Analytics",
  description: "Production-grade football game analysis platform with AI-powered play detection, pre-snap motion tracking, telestration tools, and collaborative coaching features with @mentions and action items.",
  keywords: ["football analytics", "film study", "pre-snap motion", "coaching tools", "AI video analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
