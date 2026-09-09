import { redirect } from "next/navigation";

interface StylistsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StylistsPage({ searchParams }: StylistsPageProps) {
  const resolvedParams = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (typeof value === "string") {
      sp.set(key, value);
    } else if (Array.isArray(value)) {
      for (const v of value) sp.append(key, v);
    }
  }
  const queryString = sp.toString();
  redirect(queryString ? `/?${queryString}` : "/");
}
