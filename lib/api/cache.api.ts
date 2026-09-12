import { apiClient } from "./client";

/**
 * Clears backend application-level caches (currently a no-op stub on the
 * backend, reserved for a future Redis / in-memory cache layer).
 */
export async function clearBackendCache() {
  const { data } = await apiClient.post<{
    success: boolean;
    clearedAt: string;
    message: string;
  }>("/admin/cache/clear");
  return data;
}

/**
 * Triggers Next.js ISR revalidation on the frontend via the admin's own
 * server-side proxy route at POST /api/revalidate.
 *
 * The proxy reads SITE_REVALIDATE_URL and REVALIDATE_SECRET from server-side
 * env vars, so secrets are never exposed to the browser.
 *
 * Required Vercel env vars on the ADMIN project:
 *   SITE_REVALIDATE_URL  = https://www.shaarian.com/api/revalidate
 *   REVALIDATE_SECRET    = <shared secret matching frontend REVALIDATE_SECRET>
 */
export async function clearFrontendCache(): Promise<{ ok: boolean; skipped?: boolean }> {
  const res = await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // No body needed — the proxy reads SITE_REVALIDATE_URL + REVALIDATE_SECRET
    // from server-side env vars and injects the secret itself.
  });

  const data = (await res.json().catch(() => ({ ok: false }))) as {
    ok: boolean;
    skipped?: boolean;
  };

  if (!res.ok) {
    throw new Error(
      `Frontend revalidate proxy returned HTTP ${res.status}`,
    );
  }

  return data;
}
