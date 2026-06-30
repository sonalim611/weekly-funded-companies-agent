import type { Metadata } from "next";

export const siteName = "StartWithStartup";

export const siteDescription =
  "Match your resume to recently funded YC startups and get a personalized application strategy in minutes.";

export const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "StartWithStartup — Land your role at a recently funded startup",
} as const;

export function getSiteUrl(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return new URL(fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return new URL(`https://${vercelUrl}/`);
  }

  return new URL("http://localhost:3000/");
}

export function buildPageMetadata({
  title,
  description = siteDescription,
  path = "/",
}: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
