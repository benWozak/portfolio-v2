// src/lib/site.ts
// One home for the strings the metadata blocks repeat. Next replaces a nested
// `openGraph` or `twitter` object wholesale per segment, so a page that sets one
// restates everything: openGraph needs type, siteName, locale, url, title,
// description and images; twitter needs card, title, description and images.
export const SITE_URL = "https://benwozak.dev";
export const SITE_NAME = "Ben Wozaks Portfolio";
export const SITE_LOCALE = "en_US";
export const SITE_IMAGE = {
  url: `${SITE_URL}/BW_logo.svg`,
  width: 1200,
  height: 630,
  alt: "Ben Wozak - Software Developer",
};
