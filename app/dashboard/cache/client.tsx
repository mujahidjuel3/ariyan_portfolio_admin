"use client";

import { useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui";
import { FormMessage } from "@/components/forms/FormField";
import { clearBackendCache, clearFrontendCache } from "@/api/cache.api";
import { getMutationMessage } from "@/helpers/mutation";

export default function CachePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function onClear() {
    if (!window.confirm("Clear application content cache?")) return;
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      const backend = await clearBackendCache();
      let extra = "";
      try {
        const front = await clearFrontendCache();
        if (front) extra = " Frontend revalidated.";
      } catch {
        extra = " Frontend revalidate skipped or failed (optional).";
      }
      setMessage(`${backend.message}.${extra}`);
    } catch (err) {
      setError(true);
      setMessage(getMutationMessage(err, "Failed to clear cache"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Cache"
        description="Clear content caches after publishing major updates."
      />
      <Card className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This triggers a JWT-protected backend cache clear. If{" "}
          <code className="text-xs">NEXT_PUBLIC_SITE_REVALIDATE_URL</code> is set,
          the public site ISR cache is also revalidated.
        </p>
        <Button onClick={() => void onClear()} disabled={loading}>
          {loading ? "Clearing…" : "Clear Cache"}
        </Button>
        <FormMessage message={message} isError={error} />
      </Card>
    </div>
  );
}
