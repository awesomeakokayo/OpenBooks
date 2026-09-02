import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

const PRIVATE_PATHS = [
  "/dashboard/",
  "/customers/",
  "/sales/",
  "/expenses/",
  "/invoices/",
  "/payments/",
  "/receipts/",
  "/reports/",
  "/business/",
  "/invoice/",
  "/api/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password/",
  "/verify-email/",
  "/auth-error/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
