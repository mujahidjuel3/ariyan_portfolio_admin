"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import {
  useCertifications,
  useCreateCertification,
  useDeleteCertification,
  useUpdateCertification,
} from "@/hooks/useCertifications";
import type { CertificationRecord } from "@/lib/api/certification.api";

export default function CertificationsPage() {
  const { data, isLoading } = useCertifications();
  const create = useCreateCertification();
  const update = useUpdateCertification();
  const remove = useDeleteCertification();
  const [editing, setEditing] = useState<CertificationRecord | "new" | null>(null);
  const [draft, setDraft] = useState<
    Partial<CertificationRecord> & { imageMediaId?: string }
  >({});

  if (isLoading || !data) return <LoadingState />;

  async function save() {
    if (editing === "new") await create.mutateAsync(draft);
    else if (editing) await update.mutateAsync({ id: editing.id, payload: draft });
    setEditing(null);
  }

  if (editing) {
    return (
      <div>
        <PageHeader
          title={editing === "new" ? "New Certification" : "Edit Certification"}
          action={
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Back
            </Button>
          }
        />
        <Card className="space-y-4">
          <Field label="Title">
            <Input
              value={draft.title ?? ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Date / Year">
            <Input
              value={draft.date ?? ""}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
          <HtmlRichTextEditor
            label="Description"
            value={draft.description ?? ""}
            onChange={(html) => setDraft({ ...draft, description: html })}
            folder="certifications"
          />
          <Field label="Image Alt">
            <Input
              value={draft.imageAlt ?? ""}
              onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
            />
          </Field>
          <ImageUpload
            label="Certificate Image"
            folder="certifications"
            value={{ url: draft.image, mediaId: draft.imageMediaId }}
            onChange={(v) =>
              setDraft({ ...draft, image: v.url, imageMediaId: v.mediaId })
            }
          />
          <Button onClick={() => void save()} disabled={create.isPending || update.isPending}>
            Save
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Certifications"
        description="Manage certification accordion items."
        action={
          <Button
            onClick={() => {
              setDraft({});
              setEditing("new");
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        }
      />
      <div className="space-y-3">
        {data.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-500">{item.date}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(item);
                  setEditing(item);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                className="text-red-600"
                onClick={() => remove.mutate(item.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
