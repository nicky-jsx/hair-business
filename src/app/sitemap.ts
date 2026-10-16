import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site-config";

// Rebuilt at most once an hour.
export const revalidate = 3600;

const PAGE_SIZE = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/stylists`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const supabase = getSupabase();
  if (!supabase) return entries;

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("stylists")
      .select("id, updated_at")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data) break;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of data as any[]) {
      entries.push({
        url: `${SITE_URL}/stylists/${row.id}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    if (data.length < PAGE_SIZE) break;
  }

  return entries;
}
