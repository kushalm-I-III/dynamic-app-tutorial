import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poetry Sharing",
  description: "Share your poems with the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-stone-50">{children}</body>
    </html>
  );
}
