"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import { useCreateTestimonial, useDeleteTestimonial, useTestimonials, useUpdateTestimonial } from "@/hooks/useTestimonials";
import type { TestimonialRecord } from "@/lib/api/testimonial.api";

export default function TestimonialsPage() {
  const { data, isLoading } = useTestimonials();
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();
  const remove = useDeleteTestimonial();
  const [editing, setEditing] = useState<TestimonialRecord | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<TestimonialRecord> & { avatarMediaId?: string }>({});

  if (isLoading || !data) return <LoadingState />;

  async function save() {
    if (editing === "new") await create.mutateAsync(draft);
    else if (editing) await update.mutateAsync({ id: editing.id, payload: draft });
    setEditing(null);
  }

  if (editing) {
    return (
      <div>
        <PageHeader title={editing === "new" ? "New Testimonial" : "Edit Testimonial"} action={<Button variant="secondary" onClick={() => setEditing(null)}>Back</Button>} />
        <Card className="space-y-4">
          <Field label="Name"><Input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field label="Role"><Input value={draft.role ?? ""} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></Field>
          <HtmlRichTextEditor
            label="Quote"
            value={draft.quote ?? ""}
            onChange={(html) => setDraft({ ...draft, quote: html })}
            folder="testimonials"
            minHeightClass="min-h-[140px]"
          />
          <Field label="Rating"><Input type="number" value={draft.rating ?? ""} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })} /></Field>
          <ImageUpload label="Avatar" folder="testimonials" value={{ url: draft.avatar, mediaId: draft.avatarMediaId }} onChange={(v) => setDraft({ ...draft, avatar: v.url, avatarMediaId: v.mediaId })} />
          <Button onClick={() => void save()}>Save</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Testimonials" description="Client testimonials." action={<Button onClick={() => { setDraft({}); setEditing("new"); }}><Plus className="size-4" /> Add</Button>} />
      <div className="space-y-3">
        {data.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div><p className="font-medium">{t.name}</p><p className="text-sm text-slate-500">{t.role}</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setDraft(t); setEditing(t); }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(t.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
