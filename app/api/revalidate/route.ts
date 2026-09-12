import { NextResponse } from "next/server";

/**
 * Server-side proxy that triggers the frontend ISR revalidation.
 * Called by the admin client after every mutation — runs server-side so
 * SITE_REVALIDATE_URL and REVALIDATE_SECRET are never exposed to the browser.
 */
export async function POST() {
  const url = process.env.SITE_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!url || !secret) {
    // Not configured — treat as a no-op (admin still works, just no instant revalidate)
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
      // Bypass Next.js fetch cache on the admin side
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[revalidate] Frontend responded ${res.status}: ${text}`);
      return NextResponse.json(
        { ok: false, status: res.status },
        { status: 502 },
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("[revalidate] Failed to reach frontend:", err);
    return NextResponse.json({ ok: false, error: "unreachable" }, { status: 502 });
  }
}
