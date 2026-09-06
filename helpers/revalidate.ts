import { clearBackendCache, clearFrontendCache } from "@/lib/api/cache.api";

/** Fire-and-forget public cache bust so portfolio shows admin changes quickly. */
export async function refreshPublicContent() {
  try {
    await clearBackendCache();
  } catch {
    // ignore — backend may not expose cache layer yet
  }
  try {
    await clearFrontendCache();
  } catch {
    // ignore when SITE_REVALIDATE_URL is not configured
  }
}
