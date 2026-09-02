import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Mono, Inter, Manrope } from "next/font/google";
import { WorkspaceNavigationStateProvider } from "@/components/workspace/WorkspaceNavigationState";
import { SITE_DESCRIPTION, SITE_LOGO, SITE_NAME, SITE_URL } from "@/lib/seo/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OpenBooks — Simple bookkeeping, invoicing and payment tracking",
    template: "%s | OpenBooks",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "business",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "OpenBooks — Simple bookkeeping, invoicing and payment tracking",
    description: SITE_DESCRIPTION,
    images: [{ url: SITE_LOGO, width: 512, height: 512, alt: "OpenBooks logo" }],
  },
  twitter: {
    card: "summary",
    title: "OpenBooks — Simple bookkeeping, invoicing and payment tracking",
    description: SITE_DESCRIPTION,
    images: [SITE_LOGO],
  },
  icons: {
    icon: [{ url: OPENBOOKS_ICON, type: "image/png" }],
    shortcut: [{ url: OPENBOOKS_ICON, type: "image/png" }],
    apple: [{ url: OPENBOOKS_ICON, type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: "OpenBooks NG",
        url: SITE_URL,
        logo: SITE_LOGO,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        alternateName: "OpenBooks NG",
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <html lang="en-NG" className={`${inter.variable} ${manrope.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-plum">
        <WorkspaceNavigationStateProvider>{children}</WorkspaceNavigationStateProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
      <Analytics mode="production" />
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
