import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-openbooks",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const OPENBOOKS_ICON = "/OPENBOOKS_LOGO.png?v=2";

export const metadata: Metadata = {
  title: "OpenBooks NG — Your business notebook, but digital.",
  description:
    "Record sales, send invoices, collect payments and keep track of what your business is owed. Nigeria-first, mobile-first, open-source.",
  icons: {
    icon: [{ url: OPENBOOKS_ICON, type: "image/png" }],
    shortcut: [{ url: OPENBOOKS_ICON, type: "image/png" }],
    apple: [{ url: OPENBOOKS_ICON, type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-plum">{children}</body>
      {googleAnalyticsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
    </html>
  );
}
