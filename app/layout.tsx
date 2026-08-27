import type { Metadata } from "next";
import { Inter, Manrope, DM_Serif_Display } from "next/font/google";
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

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenBooks NG — Your business notebook, but digital.",
  description:
    "Record sales, send invoices, collect payments and keep track of what your business is owed. Nigeria-first, mobile-first, open-source.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-plum">
        {children}
      </body>
    </html>
  );
}
