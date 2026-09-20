"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor, RichTextEditor, blocksToArticle, type ArticleBlock } from "@/components/RichTextEditor";
import {
  useBlogCategories,
  useBlogPost,
  useBlogPosts,
  useCreateBlogCategory,
  useCreateBlogPost,
  useDeleteBlogCategory,
  useDeleteBlogPost,
  useUpdateBlogCategory,
  useUpdateBlogPost,
} from "@/hooks/useBlog";
import { slugify } from "@/lib/utils";

type DraftState = {
  title: string;
  titleAccent: string;
  slug: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  author: string;
  readingTime: string;
  date: string;
  dateISO: string;
  image: string;
  imageAlt: string;
  imageMediaId: string;
};

const emptyDraft = (): DraftState => ({
  title: "", titleAccent: "", slug: "", excerpt: "",
  category: "design", categoryLabel: "Design",
  author: "Sha Ariyan", readingTime: "5 min read",
  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  dateISO: new Date().toISOString().slice(0, 10),
  image: "", imageAlt: "", imageMediaId: "",
});

export default function BlogsPage() {
  const { data, isLoading } = useBlogPosts();
  const { data: categories } = useBlogCategories();
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const remove = useDeleteBlogPost();
  const createCategory = useCreateBlogCategory();
  const updateCategory = useUpdateBlogCategory();
  const deleteCategory = useDeleteBlogCategory();

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft());
  const [blocks, setBlocks] = useState<ArticleBlock[]>([{ type: "p", text: "" }]);
  const [blocksHydrated, setBlocksHydrated] = useState(false);

  // Category management state
  const [showCategories, setShowCategories] = useState(false);
  const [newCatId, setNewCatId] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState("");

  const postQuery = useBlogPost(editingId && editingId !== "new" ? editingId : null);

  // Re-hydrate article blocks from the full single-post record
  useEffect(() => {
    if (!postQuery.data || blocksHydrated) return;
    const articleBlocks = (postQuery.data.article as { blocks?: ArticleBlock[] } | null)?.blocks;
    if (articleBlocks?.length) {
      setBlocks(articleBlocks);
    }
    setBlocksHydrated(true);
  }, [postQuery.data, blocksHydrated]);

  if (isLoading || !data) return <LoadingState />;

  async function save() {
    const slug = draft.slug || slugify(draft.title);
    const article = blocksToArticle(blocks, { slug, author: draft.author });
    const payload = {
      ...draft,
      slug,
      article,
      imageMediaId: draft.imageMediaId || undefined,
    };
    if (editingId === "new") {
      await create.mutateAsync(payload);
    } else if (editingId) {
      await update.mutateAsync({ id: editingId, payload });
    }
    setEditingId(null);
  }

  // ── Category management panel ──────────────────────────────────────────
  if (showCategories) {
    return (
      <div>
        <PageHeader
          title="Blog Categories"
          action={<Button variant="secondary" onClick={() => setShowCategories(false)}>← Back to Posts</Button>}
        />
        <Card className="space-y-4">
          <p className="text-sm font-medium text-slate-600">Add New Category</p>
          <div className="flex gap-3">
            <Field label="ID (slug)" className="flex-1">
              <Input
                placeholder="e.g. ui-ux"
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
              />
            </Field>
            <Field label="Label" className="flex-1">
              <Input
                placeholder="e.g. UI/UX"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
              />
            </Field>
            <div className="flex items-end">
              <Button
                disabled={!newCatId || !newCatLabel || createCategory.isPending}
                onClick={async () => {
                  await createCategory.mutateAsync({ id: newCatId.trim(), label: newCatLabel.trim() });
                  setNewCatId(""); setNewCatLabel("");
                }}
              >
                <Plus className="size-4" /> Add
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-slate-600">Existing Categories</p>
            {(categories ?? []).map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                {editingCatId === cat.id ? (
                  <>
                    <Input
                      className="flex-1"
                      value={editingCatLabel}
                      onChange={(e) => setEditingCatLabel(e.target.value)}
                    />
                    <Button
                      variant="secondary"
                      disabled={updateCategory.isPending}
                      onClick={async () => {
                        await updateCategory.mutateAsync({ id: cat.id, payload: { label: editingCatLabel } });
                        setEditingCatId(null);
                      }}
                    >
                      Save
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingCatId(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm"><span className="font-medium">{cat.label}</span> <span className="text-slate-400">({cat.id})</span></span>
                    <Button variant="secondary" onClick={() => { setEditingCatId(cat.id); setEditingCatLabel(cat.label); }}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" className="text-red-600" onClick={() => deleteCategory.mutate(cat.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            {!(categories ?? []).length && <p className="text-sm text-slate-400">No categories yet.</p>}
          </div>
        </Card>
      </div>
    );
  }

  // ── Edit / New post form ───────────────────────────────────────────────
  if (editingId) {
    const isLoadingPost = editingId !== "new" && !blocksHydrated && postQuery.isLoading;
    if (isLoadingPost) return <LoadingState />;

    return (
      <div>
        <PageHeader
          title={editingId === "new" ? "New Post" : "Edit Post"}
          action={<Button variant="secondary" onClick={() => setEditingId(null)}>Back</Button>}
        />
        <Card className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <Field label="Title Accent (italic word in title, optional)">
            <Input
              placeholder="e.g. Design"
              value={draft.titleAccent}
              onChange={(e) => setDraft({ ...draft, titleAccent: e.target.value })}
            />
          </Field>
          <Field label="Slug">
            <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          </Field>
          <Field label="Category">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={draft.category}
              onChange={(e) => {
                const cat = (categories ?? []).find((c) => c.id === e.target.value);
                setDraft({ ...draft, category: e.target.value, categoryLabel: cat?.label ?? e.target.value });
              }}
            >
              {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Author">
            <Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
          </Field>
          <Field label="Reading Time">
            <Input value={draft.readingTime} onChange={(e) => setDraft({ ...draft, readingTime: e.target.value })} />
          </Field>
          <Field label="Date (display)">
            <Input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <Field label="Date ISO">
            <Input value={draft.dateISO} onChange={(e) => setDraft({ ...draft, dateISO: e.target.value })} />
          </Field>
          <Field label="Image Alt Text">
            <Input
              placeholder="Describe the thumbnail image"
              value={draft.imageAlt}
              onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <HtmlRichTextEditor
              label="Excerpt"
              value={draft.excerpt}
              onChange={(html) => setDraft({ ...draft, excerpt: html })}
              folder="blog"
              minHeightClass="min-h-[120px]"
            />
          </div>
          <div className="sm:col-span-2">
            <ImageUpload
              label="Thumbnail"
              folder="blog"
              value={{ url: draft.image, mediaId: draft.imageMediaId }}
              onChange={(v) => setDraft({ ...draft, image: v.url ?? "", imageMediaId: v.mediaId ?? "" })}
            />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor label="Article Content" value={blocks} onChange={setBlocks} />
          </div>
          <Button onClick={() => void save()} disabled={create.isPending || update.isPending}>
            Save Post
          </Button>
        </Card>
      </div>
    );
  }

  // ── Post list ──────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Blogs"
        description="Manage blog posts."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCategories(true)}
            >
              Categories
            </Button>
            <Button
              onClick={() => {
                setDraft(emptyDraft());
                setBlocks([{ type: "p", text: "" }]);
                setBlocksHydrated(false);
                setEditingId("new");
              }}
            >
              <Plus className="size-4" /> New Post
            </Button>
          </div>
        }
      />
      <div className="space-y-3">
        {data.map((post) => (
          <Card key={post.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{post.title}</p>
              <p className="text-sm text-slate-500">{post.categoryLabel} · {post.date}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft({
                    title: post.title,
                    titleAccent: (post as { titleAccent?: string }).titleAccent ?? "",
                    slug: post.slug,
                    excerpt: post.excerpt,
                    category: post.category,
                    categoryLabel: post.categoryLabel,
                    author: post.author,
                    readingTime: post.readingTime,
                    date: post.date,
                    dateISO: post.dateISO,
                    image: post.image,
                    imageAlt: post.imageAlt,
                    imageMediaId: "",
                  });
                  // Optimistically set blocks from list data; useEffect will overwrite with full article when loaded
                  const articleBlocks = (post.article as { blocks?: ArticleBlock[] } | null)?.blocks;
                  setBlocks(articleBlocks ?? [{ type: "p", text: "" }]);
                  setBlocksHydrated(false);
                  setEditingId(post.id);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                className="text-red-600"
                onClick={() => remove.mutate(post.id)}
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
