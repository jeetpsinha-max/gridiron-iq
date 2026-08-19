import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peddie Football Analytics | Sports Analytics & Coaching Platform",
  description: "The Peddie School Falcons' official AI-powered Sports Analytics & Coaching platform. All-22 film breakdown, player performance rankings, pre-snap motion tracking, and real-time coaching intelligence.",
  keywords: ["Peddie School", "football analytics", "S.A.C.", "sports analytics", "coaching platform", "film study", "AI video analysis"],
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
