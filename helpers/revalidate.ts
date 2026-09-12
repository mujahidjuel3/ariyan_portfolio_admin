import { clearBackendCache, clearFrontendCache } from "@/lib/api/cache.api";

/** Fire-and-forget public cache bust so portfolio shows admin changes quickly. */
export async function refreshPublicContent() {
  try {
    await clearBackendCache();
  } catch {
    // Backend cache clear is a stub — ignore silently
  }
  try {
    await clearFrontendCache();
  } catch (err) {
    // Log so we can debug revalidation failures without breaking the UI
    console.warn("[refreshPublicContent] Frontend revalidation failed:", err);
  }
}
