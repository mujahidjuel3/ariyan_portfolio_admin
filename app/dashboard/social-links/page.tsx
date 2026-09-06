"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { useCreateSocialLink, useDeleteSocialLink, useSocialLinks, useUpdateSocialLink } from "@/hooks/useSocial";

const platforms = ["linkedin", "figma", "behance", "dribbble", "instagram", "x"] as const;

export default function SocialLinksPage() {
  const { data: heroLinks, isLoading: heroLoading } = useSocialLinks("hero");
  const { data: footerLinks, isLoading: footerLoading } = useSocialLinks("footer");
  const create = useCreateSocialLink();
  const update = useUpdateSocialLink();
  const remove = useDeleteSocialLink();
  const [draft, setDraft] = useState({ label: "", href: "", platform: "linkedin" as string, location: "hero" as "hero" | "footer" });

  if (heroLoading || footerLoading) return <LoadingState />;

  function renderList(location: "hero" | "footer", items = location === "hero" ? heroLinks : footerLinks) {
    return (
      <Card className="mb-6">
        <h2 className="mb-4 font-medium capitalize">{location} social links</h2>
        <div className="space-y-2">
          {(items ?? []).map((link) => (
            <div key={link.id} className="grid gap-2 sm:grid-cols-4">
              <Input defaultValue={link.label} onBlur={(e) => update.mutate({ id: link.id, payload: { label: e.target.value } })} />
              <Input defaultValue={link.href} onBlur={(e) => update.mutate({ id: link.id, payload: { href: e.target.value } })} />
              <Input defaultValue={link.platform} onBlur={(e) => update.mutate({ id: link.id, payload: { platform: e.target.value } })} />
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(link.id)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Social Links" description="Hero and footer social profiles." />
      <Card className="mb-6 grid gap-2 sm:grid-cols-5">
        <Field label="Label"><Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></Field>
        <Field label="URL"><Input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} /></Field>
        <Field label="Platform">
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })}>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Location">
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value as "hero" | "footer" })}>
            <option value="hero">Hero</option>
            <option value="footer">Footer</option>
          </select>
        </Field>
        <div className="flex items-end"><Button onClick={() => void create.mutateAsync(draft).then(() => setDraft({ label: "", href: "", platform: "linkedin", location: "hero" }))}><Plus className="size-4" /> Add</Button></div>
      </Card>
      {renderList("hero")}
      {renderList("footer")}
    </div>
  );
}
