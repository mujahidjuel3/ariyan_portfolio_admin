import { apiClient } from "./client";

export async function clearBackendCache() {
  const { data } = await apiClient.post<{
    success: boolean;
    clearedAt: string;
    message: string;
  }>("/admin/cache/clear");
  return data;
}

/**
 * Triggers Next.js ISR revalidation on the frontend via a server-side proxy
 * route on the admin app (/api/revalidate). The proxy uses non-public env vars
 * (SITE_REVALIDATE_URL + REVALIDATE_SECRET) so secrets stay server-side only.
 */
export async function clearFrontendCache() {
  const res = await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Frontend revalidate failed: ${res.status}`);
  return res.json();
}
