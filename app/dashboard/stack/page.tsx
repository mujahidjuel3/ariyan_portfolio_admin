"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import { useCreateStackItem, useDeleteStackItem, useStack, useUpdateStackItem } from "@/hooks/useStack";
import type { StackRecord } from "@/api/stack.api";

export default function StackPage() {
  const { data, isLoading } = useStack();
  const create = useCreateStackItem();
  const update = useUpdateStackItem();
  const remove = useDeleteStackItem();
  const [editing, setEditing] = useState<StackRecord | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<StackRecord> & { iconMediaId?: string }>({ name: "", description: "" });

  if (isLoading || !data) return <LoadingState />;

  async function save() {
    if (!draft.name) return;
    if (editing === "new") await create.mutateAsync(draft);
    else if (editing) await update.mutateAsync({ id: editing.id, payload: draft });
    setEditing(null);
  }

  if (editing) {
    return (
      <div>
        <PageHeader title={editing === "new" ? "New Stack Item" : "Edit Stack Item"} action={<Button variant="secondary" onClick={() => setEditing(null)}>Back</Button>} />
        <Card className="space-y-4">
          <Field label="Name"><Input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <HtmlRichTextEditor
            label="Description"
            value={draft.description ?? ""}
            onChange={(html) => setDraft({ ...draft, description: html })}
            folder="stack"
            minHeightClass="min-h-[140px]"
          />
          <Field label="Category"><Input value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></Field>
          <Field label="Progress"><Input type="number" value={draft.progress ?? ""} onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })} /></Field>
          <ImageUpload label="Icon" folder="stack" value={{ url: draft.icon, mediaId: draft.iconMediaId }} onChange={(v) => setDraft({ ...draft, icon: v.url, iconMediaId: v.mediaId })} />
          <Button onClick={() => void save()}>Save</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Stack" description="Manage tech stack items." action={<Button onClick={() => { setDraft({ name: "", description: "" }); setEditing("new"); }}><Plus className="size-4" /> Add</Button>} />
      <div className="space-y-3">
        {data.map((item) => (
          <Card key={item.id} className="flex items-center justify-between">
            <div><p className="font-medium">{item.name}</p><p className="text-sm text-slate-500">{item.description?.replace(/<[^>]+>/g, " ")}</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setDraft(item); setEditing(item); }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(item.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
