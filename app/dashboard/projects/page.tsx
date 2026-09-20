"use client";

import { useEffect, useState } from "react";
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
import type { ProjectRecord } from "@/lib/api/projects.api";
import { slugify } from "@/lib/utils";

// ─── Empty template for new projects ─────────────────────────────────────────
const empty = (): Partial<ProjectRecord> & { coverMediaId?: string } => ({
  slug: "", title: "", category: "Web Design", client: "", duration: "", image: "",
  gallery: [], previewHref: "#", ctaHref: "#contact", ctaLabel: "View Project",
  summary: "", content: [{ type: "p", text: "" }], technologies: [], featured: false,
  heroLayout: "full", heroBackground: "",
});

// ─── Edit form — separate component so hooks always run unconditionally ───────
function ProjectEditForm({
  editingId,
  initialDraft,
  initialBlocks,
  onBack,
}: {
  editingId: string;
  initialDraft: Partial<ProjectRecord> & { coverMediaId?: string };
  initialBlocks: ArticleBlock[];
  onBack: () => void;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [contentBlocks, setContentBlocks] = useState<ArticleBlock[]>(initialBlocks);

  const projectQuery = useProject(editingId !== "new" ? editingId : null);
  const create = useCreateProject();
  const update = useUpdateProject();
  const addImage = useAddProjectImage();
  const deleteImage = useDeleteProjectImage();

  // Once the full record arrives, upgrade the draft (adds images, full content, etc.)
  useEffect(() => {
    if (!projectQuery.data) return;
    const p = projectQuery.data;
    setDraft({ ...p, coverMediaId: undefined });
    setContentBlocks((p.content as ArticleBlock[] | undefined) ?? [{ type: "p", text: "" }]);
  }, [projectQuery.data]);

  async function save() {
    const payload = {
      ...draft,
      slug: draft.slug || slugify(draft.title ?? ""),
      title: draft.title ?? "",
      category: draft.category ?? "",
      client: draft.client ?? "",
      duration: draft.duration ?? "",
      image: draft.image ?? "",
      previewHref: draft.previewHref ?? "#",
      ctaHref: draft.ctaHref ?? "#contact",
      ctaLabel: draft.ctaLabel ?? "View Project",
      summary: draft.summary ?? "",
      content: contentBlocks as ProjectRecord["content"],
      technologies: draft.technologies ?? [],
      githubUrl: draft.githubUrl,
      liveUrl: draft.liveUrl,
      featured: draft.featured,
      coverMediaId: draft.coverMediaId,
      heroLayout: draft.heroLayout,
      heroBackground: draft.heroBackground,
    };
    if (editingId === "new") {
      await create.mutateAsync(payload);
    } else {
      await update.mutateAsync({ id: editingId, payload });
    }
    onBack();
  }

  const images = projectQuery.data?.images ?? [];

  return (
    <div>
      <PageHeader
        title={editingId === "new" ? "New Project" : "Edit Project"}
        action={<Button variant="secondary" onClick={onBack}>Back</Button>}
      />
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input value={draft.slug ?? ""} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          </Field>
          <Field label="Category">
            <Input value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          </Field>
          <Field label="Client">
            <Input value={draft.client ?? ""} onChange={(e) => setDraft({ ...draft, client: e.target.value })} />
          </Field>
          <Field label="Duration">
            <Input value={draft.duration ?? ""} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} />
          </Field>
          <Field label="CTA Label">
            <Input value={draft.ctaLabel ?? ""} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} />
          </Field>
          <Field label="CTA Href">
            <Input value={draft.ctaHref ?? ""} onChange={(e) => setDraft({ ...draft, ctaHref: e.target.value })} />
          </Field>
          <Field label="Preview Href">
            <Input value={draft.previewHref ?? ""} onChange={(e) => setDraft({ ...draft, previewHref: e.target.value })} />
          </Field>
          <Field label="Github URL">
            <Input value={draft.githubUrl ?? ""} onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })} />
          </Field>
          <Field label="Live URL">
            <Input value={draft.liveUrl ?? ""} onChange={(e) => setDraft({ ...draft, liveUrl: e.target.value })} />
          </Field>
          <Field label="Technologies (comma separated)" className="sm:col-span-2">
            <Input
              value={(draft.technologies ?? []).join(", ")}
              onChange={(e) => setDraft({ ...draft, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
            />
          </Field>
          <Field label="Hero Layout" className="sm:col-span-2">
            <div className="flex gap-6 pt-1">
              {(["full", "container"] as const).map((v) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
                  <input
                    type="radio"
                    name="heroLayout"
                    value={v}
                    checked={(draft.heroLayout ?? "full") === v}
                    onChange={() => setDraft({ ...draft, heroLayout: v })}
                  />
                  {v}
                </label>
              ))}
            </div>
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.featured ?? false}
              onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
            />
            Featured project
          </label>
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

        <ImageUpload
          label="Hero Background Image (optional)"
          folder="projects"
          value={{ url: draft.heroBackground ?? "" }}
          onChange={(v) => setDraft({ ...draft, heroBackground: v.url ?? "" })}
        />

        {editingId !== "new" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Gallery Images</p>
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { data, isLoading } = useProjects();
  const remove = useDeleteProject();

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ProjectRecord> & { coverMediaId?: string }>(empty());
  const [editBlocks, setEditBlocks] = useState<ArticleBlock[]>([{ type: "p", text: "" }]);

  if (isLoading || !data) return <LoadingState />;

  if (editingId) {
    return (
      <ProjectEditForm
        editingId={editingId}
        initialDraft={editDraft}
        initialBlocks={editBlocks}
        onBack={() => setEditingId(null)}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage portfolio projects."
        action={
          <Button onClick={() => {
            setEditDraft(empty());
            setEditBlocks([{ type: "p", text: "" }]);
            setEditingId("new");
          }}>
            <Plus className="size-4" /> New Project
          </Button>
        }
      />
      <div className="space-y-3">
        {data.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-slate-500">{p.category}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditDraft({ ...empty(), ...p, coverMediaId: undefined });
                  setEditBlocks((p.content as ArticleBlock[] | undefined) ?? [{ type: "p", text: "" }]);
                  setEditingId(p.id);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                className="text-red-600"
                onClick={() => remove.mutate(p.id)}
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
