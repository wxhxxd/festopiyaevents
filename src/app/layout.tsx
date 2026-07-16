import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = {
  variable: "font-geist-sans",
};

const geistMono = {
  variable: "font-geist-mono",
};

const melfina = localFont({
  src: "../../public/fonts/Melfina-Exfont7b3f.otf",
  variable: "--font-melfina",
});

export const metadata: Metadata = {
  title: "Festopiya | India's Event OS",
  description: "The B2B digital marketplace connecting event organizers with premium vendors.",
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon.ico?v=2",
    apple: "/favicon.ico?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${melfina.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
