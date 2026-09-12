import { NextResponse } from "next/server";

/**
 * Server-side proxy: receives a POST from the admin browser client,
 * then forwards a revalidation request to the frontend Next.js app.
 *
 * Env vars required (Vercel admin project):
 *   SITE_REVALIDATE_URL  — full URL to frontend /api/revalidate endpoint
 *                          e.g. https://www.shaarian.com/api/revalidate
 *   REVALIDATE_SECRET    — shared secret (must match frontend REVALIDATE_SECRET)
 */
export async function POST() {
  const url = process.env.SITE_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!url || !secret) {
    console.warn(
      "[admin/revalidate] SITE_REVALIDATE_URL or REVALIDATE_SECRET not set — skipping frontend revalidation",
    );
    // Return ok:true so the admin UI does not show an error to the user.
    // The frontend ISR 10s timer will pick up changes automatically.
    return NextResponse.json({ ok: true, skipped: true });
  }

  console.log("[admin/revalidate] Sending revalidation request to:", url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Include the shared secret so the frontend can verify the request
      body: JSON.stringify({ secret }),
      // Never use Next.js fetch cache here — always go to the live frontend
      cache: "no-store",
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error(
        `[admin/revalidate] Frontend responded HTTP ${res.status}: ${responseText}`,
      );
      return NextResponse.json(
        { ok: false, status: res.status, body: responseText },
        { status: 502 },
      );
    }

    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      // Frontend returned non-JSON — still treat as success if status was ok
    }

    console.log("[admin/revalidate] Frontend revalidated successfully:", data);
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("[admin/revalidate] Network error reaching frontend:", err);
    return NextResponse.json(
      { ok: false, error: "Could not reach frontend revalidate endpoint" },
      { status: 502 },
    );
  }
}
