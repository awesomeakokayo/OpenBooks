import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_LOGO, SITE_NAME, SITE_URL } from "@/lib/seo/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const canonical = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images: [{ url: SITE_LOGO, width: 512, height: 512, alt: `${SITE_NAME} logo` }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [SITE_LOGO],
    },
  };
}

export const defaultPublicMetadata: Metadata = {
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
};
