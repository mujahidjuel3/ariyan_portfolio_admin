"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader, SaveBar } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import {
  useCreateExperienceItem,
  useDeleteExperienceItem,
  useExperience,
  useUpdateExperienceItem,
  useUpdateExperienceMeta,
} from "@/hooks/useExperience";
import type { ExperienceRecord } from "@/api/experience.api";

export default function ExperiencePage() {
  const { data, isLoading } = useExperience();
  const updateMeta = useUpdateExperienceMeta();
  const create = useCreateExperienceItem();
  const update = useUpdateExperienceItem();
  const remove = useDeleteExperienceItem();
  const [editing, setEditing] = useState<ExperienceRecord | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<ExperienceRecord> & { logoMediaId?: string; hoverMediaId?: string }>({});
  const [cvHref, setCvHref] = useState("#");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data?.cvHref) setCvHref(data.cvHref);
  }, [data?.cvHref]);

  if (isLoading || !data) return <LoadingState />;

  async function saveMeta() {
    await updateMeta.mutateAsync({ cvHref });
    setMessage("CV link saved");
  }

  async function saveItem() {
    if (editing === "new") await create.mutateAsync(draft);
    else if (editing) await update.mutateAsync({ id: editing.id, payload: draft });
    setEditing(null);
  }

  if (editing) {
    return (
      <div>
        <PageHeader title={editing === "new" ? "New Experience" : "Edit Experience"} action={<Button variant="secondary" onClick={() => setEditing(null)}>Back</Button>} />
        <Card className="grid gap-4 sm:grid-cols-2">
          <Field label="Position"><Input value={draft.position ?? ""} onChange={(e) => setDraft({ ...draft, position: e.target.value })} /></Field>
          <Field label="Company"><Input value={draft.company ?? ""} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></Field>
          <Field label="Duration"><Input value={draft.duration ?? ""} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} /></Field>
          <Field label="Hover Alt"><Input value={draft.hoverImageAlt ?? ""} onChange={(e) => setDraft({ ...draft, hoverImageAlt: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <HtmlRichTextEditor
              label="Description"
              value={draft.description ?? ""}
              onChange={(html) => setDraft({ ...draft, description: html })}
              folder="experience"
            />
          </div>
          <ImageUpload label="Logo" folder="experience" value={{ url: draft.logoImage, mediaId: draft.logoMediaId }} onChange={(v) => setDraft({ ...draft, logoImage: v.url, logoMediaId: v.mediaId })} />
          <ImageUpload label="Hover Image" folder="experience" value={{ url: draft.hoverImage, mediaId: draft.hoverMediaId }} onChange={(v) => setDraft({ ...draft, hoverImage: v.url, hoverMediaId: v.mediaId })} />
          <Button onClick={() => void saveItem()}>Save</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Experience" description="Work history and CV link." />
      <Card className="mb-6">
        <Field label="CV Download Link"><Input value={cvHref} onChange={(e) => setCvHref(e.target.value)} /></Field>
      </Card>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setDraft({}); setEditing("new"); }}><Plus className="size-4" /> Add Experience</Button>
      </div>
      <div className="space-y-3">
        {data.items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between">
            <div><p className="font-medium">{item.position} @ {item.company}</p><p className="text-sm text-slate-500">{item.duration}</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setDraft(item); setEditing(item); }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(item.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <SaveBar onSave={() => void saveMeta()} saving={updateMeta.isPending} message={message} />
    </div>
  );
}
