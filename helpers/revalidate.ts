import { clearBackendCache, clearFrontendCache } from "@/lib/api/cache.api";

/**
 * Fire-and-forget: called after every successful mutation via MutationCache.onSuccess.
 * Clears backend cache (stub) then triggers frontend ISR revalidation.
 * Errors are logged but never thrown — they must not interrupt the admin UI flow.
 */
export async function refreshPublicContent() {
  // Step 1: Backend cache clear (stub — safe to ignore errors)
  try {
    await clearBackendCache();
  } catch {
    // Backend cache clear endpoint is currently a no-op stub; ignore silently.
  }

  // Step 2: Frontend ISR revalidation via admin server-side proxy
  try {
    const result = await clearFrontendCache();
    if (result.skipped) {
      // SITE_REVALIDATE_URL / REVALIDATE_SECRET not configured in this environment.
      // Frontend will pick up changes via the 10s ISR fallback timer.
      console.info(
        "[refreshPublicContent] Frontend revalidation skipped — env vars not set. " +
          "Changes will appear within 10 seconds via ISR fallback.",
      );
    }
  } catch (err) {
    // Log the error so it appears in Vercel function logs for debugging,
    // but do not surface it to the user — the save already succeeded.
    console.warn("[refreshPublicContent] Frontend revalidation failed:", err);
  }
}
