"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import { useCreateService, useDeleteService, useServices, useUpdateService } from "@/hooks/useServices";
import type { ServiceRecord } from "@/lib/api/services.api";

const empty = (): Partial<ServiceRecord> => ({
  number: "01", title: "", description: "", shapeImage: "", shapeAlt: "", status: "published",
});

export default function ServicesPage() {
  const { data, isLoading } = useServices();
  const create = useCreateService();
  const update = useUpdateService();
  const remove = useDeleteService();
  const [editing, setEditing] = useState<ServiceRecord | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<ServiceRecord> & { shapeMediaId?: string }>(empty());

  if (isLoading || !data) return <LoadingState />;

  async function save() {
    if (!draft.title || !draft.description) return;
    if (editing === "new") {
      await create.mutateAsync(draft);
    } else if (editing) {
      await update.mutateAsync({ id: editing.id, payload: draft });
    }
    setEditing(null);
  }

  if (editing) {
    return (
      <div>
        <PageHeader title={editing === "new" ? "New Service" : "Edit Service"} action={<Button variant="secondary" onClick={() => setEditing(null)}>Back</Button>} />
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Number"><Input value={draft.number ?? ""} onChange={(e) => setDraft({ ...draft, number: e.target.value })} /></Field>
            <Field label="Title"><Input value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          </div>
          <HtmlRichTextEditor
            label="Description"
            value={draft.description ?? ""}
            onChange={(html) => setDraft({ ...draft, description: html })}
            folder="services"
          />
          <ImageUpload label="Icon / Shape" folder="services" value={{ url: draft.shapeImage, mediaId: draft.shapeMediaId }} onChange={(v) => setDraft({ ...draft, shapeImage: v.url, shapeMediaId: v.mediaId })} />
          <Button onClick={() => void save()} disabled={create.isPending || update.isPending}>Save</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Services" description="Manage service cards." action={<Button onClick={() => { setDraft(empty()); setEditing("new"); }}><Plus className="size-4" /> New Service</Button>} />
      <div className="space-y-3">
        {data.map((s) => (
          <Card key={s.id} className="flex items-center justify-between gap-3">
            <div><p className="font-medium">{s.number} — {s.title}</p><p className="text-sm text-slate-500 line-clamp-1">{s.description?.replace(/<[^>]+>/g, " ")}</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setDraft(s); setEditing(s); }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(s.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
