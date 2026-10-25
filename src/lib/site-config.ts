// Single place for the public contact details and site URL used across the
// legal pages and metadata. Update these once your domain/mailboxes exist.
//
// IMPORTANT: the addresses below must be real, monitored mailboxes before
// launch — the privacy policy and terms promise users a response.

export const SITE_NAME = "SP Korter";
export const SITE_FULL_NAME = "SP Korter (Service Providers)";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://hair-business-pied.vercel.app"
).replace(/\/$/, "");

export const CONTACT_EMAILS = {
  privacy: "privacy@spkorter.com",
  legal: "legal@spkorter.com",
  takedown: "takedown@spkorter.com",
};
