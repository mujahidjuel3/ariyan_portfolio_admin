"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor, RichTextEditor, type ArticleBlock } from "@/components/RichTextEditor";
import {
  useAddProjectImage,
  useCreateProject,
  useDeleteProject,
  useDeleteProjectImage,
  useProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";
import type { ProjectRecord } from "@/api/projects.api";
import { slugify } from "@/lib/utils";

const empty = (): Partial<ProjectRecord> & { coverMediaId?: string } => ({
  slug: "", title: "", category: "Web Design", client: "", duration: "", image: "",
  gallery: [], previewHref: "#", ctaHref: "#contact", ctaLabel: "View Project",
  summary: "", content: [{ type: "p", text: "" }], technologies: [], featured: false,
});

export default function ProjectsPage() {
  const { data, isLoading } = useProjects();
  const create = useCreateProject();
  const update = useUpdateProject();
  const remove = useDeleteProject();
  const addImage = useAddProjectImage();
  const deleteImage = useDeleteProjectImage();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState(empty());
  const [contentBlocks, setContentBlocks] = useState<ArticleBlock[]>([{ type: "p", text: "" }]);

  const projectQuery = useProject(editingId && editingId !== "new" ? editingId : null);

  if (isLoading || !data) return <LoadingState />;

  async function save() {
    const payload = {
      ...draft,
      slug: draft.slug || slugify(draft.title ?? ""),
      title: draft.title!,
      category: draft.category!,
      client: draft.client!,
      duration: draft.duration!,
      image: draft.image ?? "",
      previewHref: draft.previewHref!,
      ctaHref: draft.ctaHref!,
      ctaLabel: draft.ctaLabel!,
      summary: draft.summary!,
      content: contentBlocks as ProjectRecord["content"],
      technologies: draft.technologies ?? [],
      githubUrl: draft.githubUrl,
      liveUrl: draft.liveUrl,
      featured: draft.featured,
      coverMediaId: draft.coverMediaId,
    };
    if (editingId === "new") {
      await create.mutateAsync(payload);
      setEditingId(null);
    } else if (editingId) {
      await update.mutateAsync({ id: editingId, payload });
    }
  }

  if (editingId) {
    const images = projectQuery.data?.images ?? [];
    return (
      <div>
        <PageHeader title={editingId === "new" ? "New Project" : "Edit Project"} action={<Button variant="secondary" onClick={() => setEditingId(null)}>Back</Button>} />
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
            <Field label="Slug"><Input value={draft.slug ?? ""} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></Field>
            <Field label="Category"><Input value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></Field>
            <Field label="Client"><Input value={draft.client ?? ""} onChange={(e) => setDraft({ ...draft, client: e.target.value })} /></Field>
            <Field label="Github URL"><Input value={draft.githubUrl ?? ""} onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })} /></Field>
            <Field label="Live URL"><Input value={draft.liveUrl ?? ""} onChange={(e) => setDraft({ ...draft, liveUrl: e.target.value })} /></Field>
            <Field label="Technologies (comma separated)" className="sm:col-span-2">
              <Input value={(draft.technologies ?? []).join(", ")} onChange={(e) => setDraft({ ...draft, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
            </Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.featured ?? false} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} /> Featured</label>
          </div>
          <HtmlRichTextEditor
            label="Summary / Description"
            value={draft.summary ?? ""}
            onChange={(html) => setDraft({ ...draft, summary: html })}
            folder="projects"
            minHeightClass="min-h-[140px]"
          />
          <RichTextEditor
            label="Project Content"
            value={contentBlocks}
            onChange={setContentBlocks}
          />
          <ImageUpload
            label="Cover Image"
            folder="projects"
            value={{ url: draft.image, mediaId: draft.coverMediaId }}
            onChange={(v) => setDraft({ ...draft, image: v.url, coverMediaId: v.mediaId })}
          />
          {editingId !== "new" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Gallery</p>
              <ImageUpload
                label="Add gallery image"
                folder="projects"
                value={{}}
                onChange={(v) => {
                  if (v.mediaId || v.url) {
                    void addImage.mutateAsync({
                      projectId: editingId,
                      payload: { mediaId: v.mediaId, url: v.url, type: "gallery" },
                    });
                  }
                }}
              />
              <div className="flex flex-wrap gap-3">
                {images.map((img) => (
                  <div key={img.id} className="w-40 rounded border p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="mb-2 h-24 w-full rounded object-cover" />
                    <button
                      type="button"
                      className="w-full text-xs text-red-600"
                      onClick={() => deleteImage.mutate({ projectId: editingId, imageId: img.id })}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button onClick={() => void save()} disabled={create.isPending || update.isPending}>
            Save Project
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Projects" description="Manage portfolio projects." action={<Button onClick={() => { setDraft(empty()); setContentBlocks([{ type: "p", text: "" }]); setEditingId("new"); }}><Plus className="size-4" /> New Project</Button>} />
      <div className="space-y-3">
        {data.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div><p className="font-medium">{p.title}</p><p className="text-sm text-slate-500">{p.category}</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => {
                setDraft(p);
                setContentBlocks((p.content as ArticleBlock[] | undefined) ?? [{ type: "p", text: "" }]);
                setEditingId(p.id);
              }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(p.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
