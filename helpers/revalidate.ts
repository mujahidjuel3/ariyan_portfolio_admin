import { clearBackendCache, clearFrontendCache } from "@/lib/api/cache.api";

/**
 * Fire-and-forget: called after every successful mutation via MutationCache.onSuccess.
 * Clears backend cache (stub) then triggers frontend path revalidation.
 * Errors are logged but never thrown — they must not interrupt the admin UI flow.
 *
 * Note: the public site uses cmsFetch(cache:'no-store') + force-dynamic, so
 * content is already fresh on each request. Revalidation is a CDN safety net.
 */
export async function refreshPublicContent() {
  // Step 1: Backend cache clear (stub — safe to ignore errors)
  try {
    await clearBackendCache();
  } catch {
    // Backend cache clear endpoint is currently a no-op stub; ignore silently.
  }

  // Step 2: Frontend revalidation via admin server-side proxy
  try {
    const result = await clearFrontendCache();
    if (result.skipped) {
      console.info(
        "[refreshPublicContent] Frontend revalidation skipped — env vars not set. " +
          "Site still serves fresh CMS data via cache:'no-store'.",
      );
    }
  } catch (err) {
    console.warn("[refreshPublicContent] Frontend revalidation failed:", err);
  }
}
