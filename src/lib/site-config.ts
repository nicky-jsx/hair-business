// Single place for the public contact details and site URL used across the
// legal pages and metadata. Update these once your domain/mailboxes exist.
//
// IMPORTANT: the addresses below must be real, monitored mailboxes before
// launch — the privacy policy and terms promise users a response.

export const SITE_NAME = "SP Korter";
export const SITE_FULL_NAME = "SP Korter (Service Providers)";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://spkorter.co.uk"
).replace(/\/$/, "");

export const CONTACT_EMAILS = {
  general: "info@spkorter.co.uk",
  privacy: "info@spkorter.co.uk",
  legal: "info@spkorter.co.uk",
  takedown: "info@spkorter.co.uk",
};
