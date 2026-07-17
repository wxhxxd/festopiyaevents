import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
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
  title: "Festopiya | India's Event OS - Vendor & Stall Booking Marketplace",
  description: "Festopiya is India's leading Event OS connecting event organizers with premium food stalls, local vendors, and student clubs for college fests and large-scale festivals.",
  keywords: [
    "event marketplace",
    "college fests",
    "food stall booking",
    "local vendor connections",
    "vendor marketplace",
    "stall booking",
    "college festivals",
    "India event organizer",
    "Festopiya",
    "B2B event connection",
    "event services",
    "stall booking platform",
    "event coordinator",
    "campus fests"
  ],
  metadataBase: new URL("https://festopiya.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Festopiya | India's Event OS - Vendor & Stall Booking Marketplace",
    description: "The B2B digital marketplace connecting event organizers with premium vendors and food stalls for college fests and grand celebrations.",
    url: "https://festopiya.com",
    siteName: "Festopiya",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Festopiya Event Marketplace Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Festopiya | India's Event OS",
    description: "Connect event organizers with premium food stalls and local vendors for college fests and cultural events.",
    images: ["/logo.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-2446676144525840",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://festopiya.com/#organization",
      "name": "Festopiya",
      "url": "https://festopiya.com",
      "logo": "https://festopiya.com/logo.png",
      "description": "Festopiya is a B2B digital event marketplace and Event OS connecting event organizers with premium local food vendors, stall bookings, and student clubs for college fests and cultural events.",
    },
    {
      "@type": "WebSite",
      "@id": "https://festopiya.com/#website",
      "url": "https://festopiya.com",
      "name": "Festopiya",
      "description": "India's Event OS connecting event organizers with premium food vendors for college fests in Hyderabad.",
      "publisher": {
        "@id": "https://festopiya.com/#organization"
      }
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://festopiya.com/#localbusiness",
      "name": "Festopiya",
      "image": "https://festopiya.com/logo.png",
      "url": "https://festopiya.com",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hyderabad",
        "addressRegion": "Telangana",
        "addressCountry": "IN"
      },
      "description": "Connecting event organizers with premium local food vendors and stall bookings for college fests in Hyderabad."
    }
  ]
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9W0T4LRR4Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-9W0T4LRR4Z');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
