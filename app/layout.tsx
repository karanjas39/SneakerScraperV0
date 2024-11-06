import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sneaker Scraper",
  description: "Scrape data from https://marketplace.mainstreet.co.in/",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
