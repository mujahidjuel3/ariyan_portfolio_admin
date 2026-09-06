"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mark, Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { useEffect, useRef, useState, type RefObject, type ReactNode } from "react";
import { Label } from "@/components/ui";
import { uploadMedia } from "@/api/media.api";

export type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "code"; code: string; language?: string }
  | { type: "divider" };

const Underline = Mark.create({
  name: "underline",
  parseHTML() {
    return [
      { tag: "u" },
      { style: "text-decoration", getAttrs: (v) => (String(v).includes("underline") ? {} : false) },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["u", mergeAttributes(HTMLAttributes), 0];
  },
});

const CustomLink = Mark.create({
  name: "link",
  inclusive: false,
  addAttributes() {
    return {
      href: { default: null },
      target: { default: "_blank" },
      rel: { default: "noopener noreferrer" },
    };
  },
  parseHTML() {
    return [{ tag: "a[href]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["a", mergeAttributes(HTMLAttributes), 0];
  },
});

const CustomImage = TiptapNode.create({
  name: "image",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "img[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },
});

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blocksToHtml(blocks: ArticleBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "h2") return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === "h3") return `<h3>${escapeHtml(block.text)}</h3>`;
      if (block.type === "p") return `<p>${escapeHtml(block.text)}</p>`;
      if (block.type === "blockquote") return `<blockquote><p>${escapeHtml(block.text)}</p></blockquote>`;
      if (block.type === "ul")
        return `<ul>${block.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
      if (block.type === "ol")
        return `<ol>${block.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;
      if (block.type === "image")
        return `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || "")}" />`;
      if (block.type === "code") return `<pre><code>${escapeHtml(block.code)}</code></pre>`;
      if (block.type === "divider") return `<hr />`;
      return "";
    })
    .join("");
}

function htmlToBlocks(html: string): ArticleBlock[] {
  if (!html.trim()) return [{ type: "p", text: "" }];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks: ArticleBlock[] = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "h2") blocks.push({ type: "h2", text: el.textContent?.trim() ?? "" });
    else if (tag === "h3") blocks.push({ type: "h3", text: el.textContent?.trim() ?? "" });
    else if (tag === "blockquote")
      blocks.push({ type: "blockquote", text: el.textContent?.trim() ?? "" });
    else if (tag === "ul") {
      blocks.push({
        type: "ul",
        items: Array.from(el.querySelectorAll("li")).map((li) => li.textContent?.trim() ?? ""),
      });
    } else if (tag === "ol") {
      blocks.push({
        type: "ol",
        items: Array.from(el.querySelectorAll("li")).map((li) => li.textContent?.trim() ?? ""),
      });
    } else if (tag === "img") {
      blocks.push({
        type: "image",
        src: el.getAttribute("src") ?? "",
        alt: el.getAttribute("alt") ?? "",
      });
    } else if (tag === "pre") {
      blocks.push({ type: "code", code: el.textContent ?? "" });
    } else if (tag === "hr") {
      blocks.push({ type: "divider" });
    } else if (tag === "p") {
      const text = el.textContent?.trim() ?? "";
      if (text) blocks.push({ type: "p", text });
    } else {
      const text = el.textContent?.trim() ?? "";
      if (text) blocks.push({ type: "p", text });
    }
  });

  return blocks.length ? blocks : [{ type: "p", text: "" }];
}

type RichTextEditorProps = {
  label?: string;
  value?: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
};

function ToolbarButton({
  onClick,
  active,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded border px-2 py-1 text-xs disabled:opacity-50 ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
          : "border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function toEditorHtml(raw?: string) {
  const value = (raw ?? "").trim();
  if (!value) return "<p></p>";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.replace(/\n/g, "<br />"))}</p>`)
    .join("");
}

function EditorShell({
  label,
  editor,
  uploading,
  onPickImage,
  fileRef,
  minHeightClass = "min-h-[220px]",
}: {
  label?: string;
  editor: NonNullable<ReturnType<typeof useEditor>>;
  uploading: boolean;
  onPickImage: (file: File | undefined) => void;
  fileRef: RefObject<HTMLInputElement | null>;
  minHeightClass?: string;
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-1.5">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleMark("underline").run()}
        >
          Underline
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          Strike
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>HR</ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const href = window.prompt("Link URL");
            if (!href) {
              editor.chain().focus().unsetMark("link").run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setMark("link", { href }).run();
          }}
          active={editor.isActive("link")}
        >
          Link
        </ToolbarButton>
        <ToolbarButton disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading…" : "Image"}
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          Clear
        </ToolbarButton>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void onPickImage(e.target.files?.[0])}
      />
      <div
        className={`${minHeightClass} rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm prose prose-sm max-w-none focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:prose-invert`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

async function uploadInlineImage(
  file: File | undefined,
  editor: ReturnType<typeof useEditor>,
  folder: string,
  setUploading: (v: boolean) => void,
  fileRef: RefObject<HTMLInputElement | null>,
) {
  if (!file || !editor) return;
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    alert("Only PNG, JPG, JPEG, WEBP, GIF allowed");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be under 5MB");
    return;
  }
  setUploading(true);
  try {
    const media = await uploadMedia(file, file.name, folder);
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: { src: media.url, alt: file.name },
      })
      .run();
  } catch {
    alert("Image upload failed");
  } finally {
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }
}

export function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      CustomLink,
      CustomImage,
    ],
    content: blocksToHtml(value ?? [{ type: "p", text: "" }]),
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(htmlToBlocks(ed.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor || !value) return;
    const current = editor.getHTML();
    const next = blocksToHtml(value);
    if (current !== next) editor.commands.setContent(next);
  }, [editor, value]);

  if (!editor) return null;

  return (
    <EditorShell
      label={label}
      editor={editor}
      uploading={uploading}
      fileRef={fileRef}
      onPickImage={(file) => void uploadInlineImage(file, editor, "blog-inline", setUploading, fileRef)}
    />
  );
}

type HtmlRichTextEditorProps = {
  label?: string;
  value?: string;
  onChange: (html: string) => void;
  folder?: string;
  minHeightClass?: string;
};

/** TipTap editor that stores HTML strings (for description fields). */
export function HtmlRichTextEditor({
  label,
  value,
  onChange,
  folder = "content",
  minHeightClass = "min-h-[180px]",
}: HtmlRichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const lastEmitted = useRef("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      CustomLink,
      CustomImage,
    ],
    content: toEditorHtml(value),
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = toEditorHtml(value);
    if (next === lastEmitted.current) return;
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next);
    lastEmitted.current = next;
  }, [editor, value]);

  if (!editor) return null;

  return (
    <EditorShell
      label={label}
      editor={editor}
      uploading={uploading}
      fileRef={fileRef}
      minHeightClass={minHeightClass}
      onPickImage={(file) => void uploadInlineImage(file, editor, folder, setUploading, fileRef)}
    />
  );
}

export function blocksToArticle(blocks: ArticleBlock[], meta: { slug: string; author: string }) {
  return {
    slug: meta.slug,
    readingMinutes: Math.max(
      1,
      Math.ceil(
        blocks.reduce((n, b) => {
          if ("text" in b) return n + b.text.length;
          if ("items" in b) return n + b.items.join(" ").length;
          if ("code" in b) return n + b.code.length;
          return n;
        }, 0) / 900,
      ),
    ),
    author: {
      name: meta.author,
      bio: "",
      avatar: "",
    },
    blocks,
  };
}
