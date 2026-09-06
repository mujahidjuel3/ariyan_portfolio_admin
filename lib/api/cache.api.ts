import { apiClient } from "./client";

export async function clearBackendCache() {
  const { data } = await apiClient.post<{
    success: boolean;
    clearedAt: string;
    message: string;
  }>("/admin/cache/clear");
  return data;
}

/** Optional Next.js ISR revalidate when env is set on admin. */
export async function clearFrontendCache() {
  const url = process.env.NEXT_PUBLIC_SITE_REVALIDATE_URL;
  const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
  if (!url || !secret) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret }),
  });
  if (!res.ok) throw new Error("Frontend revalidate failed");
  return res.json();
}
