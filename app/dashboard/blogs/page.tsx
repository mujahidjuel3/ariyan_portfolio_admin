"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor, RichTextEditor, blocksToArticle, type ArticleBlock } from "@/components/RichTextEditor";
import {
  useBlogCategories,
  useBlogPost,
  useBlogPosts,
  useCreateBlogPost,
  useDeleteBlogPost,
  useUpdateBlogPost,
} from "@/hooks/useBlog";
import { slugify } from "@/lib/utils";

export default function BlogsPage() {
  const { data, isLoading } = useBlogPosts();
  const { data: categories } = useBlogCategories();
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const remove = useDeleteBlogPost();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState({
    title: "", slug: "", excerpt: "", category: "design", categoryLabel: "Design",
    author: "Sha Ariyan", readingTime: "5 min read",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    dateISO: new Date().toISOString().slice(0, 10),
    image: "", imageAlt: "", imageMediaId: "",
  });
  const [blocks, setBlocks] = useState<ArticleBlock[]>([{ type: "p", text: "" }]);

  const postQuery = useBlogPost(editingId && editingId !== "new" ? editingId : null);

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
      setEditingId(null);
    } else if (editingId) {
      await update.mutateAsync({ id: editingId, payload });
      setEditingId(null);
    }
  }

  if (editingId) {
    if (editingId !== "new" && postQuery.isLoading) return <LoadingState />;
    return (
      <div>
        <PageHeader title={editingId === "new" ? "New Post" : "Edit Post"} action={<Button variant="secondary" onClick={() => setEditingId(null)}>Back</Button>} />
        <Card className="grid gap-4 sm:grid-cols-2">
          <Field label="Title"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          <Field label="Slug"><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></Field>
          <Field label="Category">
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={draft.category} onChange={(e) => {
              const cat = categories?.find((c) => c.id === e.target.value);
              setDraft({ ...draft, category: e.target.value, categoryLabel: cat?.label ?? e.target.value });
            }}>
              {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Author"><Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></Field>
          <Field label="Reading Time"><Input value={draft.readingTime} onChange={(e) => setDraft({ ...draft, readingTime: e.target.value })} /></Field>
          <Field label="Date ISO"><Input value={draft.dateISO} onChange={(e) => setDraft({ ...draft, dateISO: e.target.value })} /></Field>
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
            <ImageUpload label="Thumbnail" folder="blog" value={{ url: draft.image, mediaId: draft.imageMediaId }} onChange={(v) => setDraft({ ...draft, image: v.url ?? "", imageMediaId: v.mediaId ?? "" })} />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor label="Article Content" value={blocks} onChange={setBlocks} />
          </div>
          <Button onClick={() => void save()} disabled={create.isPending || update.isPending}>Save Post</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Blogs" description="Manage blog posts." action={<Button onClick={() => { setDraft({ title: "", slug: "", excerpt: "", category: "design", categoryLabel: "Design", author: "Sha Ariyan", readingTime: "5 min read", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), dateISO: new Date().toISOString().slice(0, 10), image: "", imageAlt: "", imageMediaId: "" }); setBlocks([{ type: "p", text: "" }]); setEditingId("new"); }}><Plus className="size-4" /> New Post</Button>} />
      <div className="space-y-3">
        {data.map((post) => (
          <Card key={post.id} className="flex items-center justify-between">
            <div><p className="font-medium">{post.title}</p><p className="text-sm text-slate-500">{post.categoryLabel} · {post.date}</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => {
                setDraft({
                  title: post.title, slug: post.slug, excerpt: post.excerpt, category: post.category,
                  categoryLabel: post.categoryLabel, author: post.author, readingTime: post.readingTime,
                  date: post.date, dateISO: post.dateISO, image: post.image, imageAlt: post.imageAlt, imageMediaId: "",
                });
                const articleBlocks = (post.article as { blocks?: ArticleBlock[] } | undefined)?.blocks;
                setBlocks(articleBlocks ?? [{ type: "p", text: "" }]);
                setEditingId(post.id);
              }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(post.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
