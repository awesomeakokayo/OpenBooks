import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/customers/",
          "/sales/",
          "/expenses/",
          "/invoices/",
          "/payments/",
          "/receipts/",
          "/reports/",
          "/business/",
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password/",
          "/verify-email/",
          "/auth-error/",
        ],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/customers/",
          "/sales/",
          "/expenses/",
          "/invoices/",
          "/payments/",
          "/receipts/",
          "/reports/",
          "/business/",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
