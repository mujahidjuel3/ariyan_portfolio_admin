"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Extension, Mark, Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code2,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  Baseline,
} from "lucide-react";
import { Label } from "@/components/ui";
import { uploadMedia } from "@/lib/api/media.api";
import { getApiErrorMessage } from "@/helpers/api-error";

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

const TextColor = Mark.create({
  name: "textColor",
  addAttributes() {
    return {
      color: { default: null },
    };
  },
  parseHTML() {
    return [
      {
        style: "color",
        getAttrs: (value) => (value ? { color: value } : false),
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    if (!HTMLAttributes.color) return ["span", 0];
    return ["span", { style: `color: ${HTMLAttributes.color}` }, 0];
  },
});

const TextAlign = Extension.create({
  name: "textAlign",
  addGlobalAttributes() {
    return [
      {
        types: ["heading", "paragraph"],
        attributes: {
          textAlign: {
            default: "left",
            parseHTML: (element) => (element as HTMLElement).style.textAlign || "left",
            renderHTML: (attributes) => {
              if (!attributes.textAlign || attributes.textAlign === "left") return {};
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
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

const CustomIframe = TiptapNode.create({
  name: "iframe",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      title: { default: "Embedded media" },
    };
  },
  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        class: "w-full aspect-video rounded-lg border border-slate-200",
        allowfullscreen: "true",
      }),
    ];
  },
});

const EmbedCard = TiptapNode.create({
  name: "embedCard",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      href: { default: "" },
      title: { default: "" },
      image: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="embed-card"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "embed-card",
        class: "my-3 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3",
      }),
      HTMLAttributes.image
        ? ["img", { src: HTMLAttributes.image, alt: "", class: "h-16 w-24 rounded object-cover" }]
        : ["div", { class: "h-16 w-24 rounded bg-slate-200" }],
      [
        "a",
        {
          href: HTMLAttributes.href || "#",
          target: "_blank",
          rel: "noopener noreferrer",
          class: "font-semibold text-slate-800 underline-offset-2 hover:underline",
        },
        HTMLAttributes.title || "Embedded link",
      ],
    ];
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

function toEditorHtml(raw?: string) {
  const value = (raw ?? "").trim();
  if (!value) return "<p></p>";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.replace(/\n/g, "<br />"))}</p>`)
    .join("");
}

function IconBtn({
  onClick,
  active,
  children,
  disabled,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-slate-700 transition disabled:opacity-40 ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
          : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />;
}

const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  CustomLink,
  TextColor,
  TextAlign,
  CustomImage,
  CustomIframe,
  EmbedCard,
];

async function uploadInlineImage(
  file: File | undefined,
  editor: Editor | null,
  folder: string,
  setUploading: (v: boolean) => void,
  fileRef: RefObject<HTMLInputElement | null>,
) {
  if (!file || !editor) return;
  const okType =
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(file.name);
  if (!okType) {
    alert("Only image files allowed (PNG, JPG, WEBP, GIF, SVG, ICO)");
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
  } catch (err) {
    alert(getApiErrorMessage(err, "Image upload failed"));
  } finally {
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }
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
  editor: Editor;
  uploading: boolean;
  onPickImage: (file: File | undefined) => void;
  fileRef: RefObject<HTMLInputElement | null>;
  minHeightClass?: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState("");
  const colorRef = useRef<HTMLInputElement>(null);

  function setBlock(value: string) {
    if (value === "paragraph") editor.chain().focus().setParagraph().run();
    if (value === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
    if (value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
    if (value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
  }

  function currentBlock() {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  }

  function openSource() {
    setSource(editor.getHTML());
    setShowSource(true);
  }

  function applySource() {
    editor.commands.setContent(source || "<p></p>");
    setShowSource(false);
  }

  function setAlign(alignment: string) {
    editor.chain().focus().updateAttributes("paragraph", { textAlign: alignment }).run();
    editor.chain().focus().updateAttributes("heading", { textAlign: alignment }).run();
  }

  function insertVideo() {
    const url = window.prompt("Video embed URL (YouTube/Vimeo/mp4)");
    if (!url) return;
    editor.chain().focus().insertContent({ type: "iframe", attrs: { src: url } }).run();
  }

  function insertLinkEmbed() {
    const href = window.prompt("Link URL") || "";
    if (!href) return;
    const title = window.prompt("Link title") || href;
    const image = window.prompt("Thumbnail image URL (optional)") || "";
    editor
      .chain()
      .focus()
      .insertContent({
        type: "embedCard",
        attrs: { href, title, image },
      })
      .run();
  }

  function insertTable() {
    editor
      .chain()
      .focus()
      .insertContent(
        `<table style="width:100%;border-collapse:collapse"><tr><th style="border:1px solid #cbd5e1;padding:6px">Header</th><th style="border:1px solid #cbd5e1;padding:6px">Header</th></tr><tr><td style="border:1px solid #cbd5e1;padding:6px">Cell</td><td style="border:1px solid #cbd5e1;padding:6px">Cell</td></tr></table><p></p>`,
      )
      .run();
  }

  const shell = (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
        fullscreen ? "fixed inset-4 z-[80] flex flex-col" : ""
      }`}
    >
      {label && !fullscreen ? <div className="border-b border-slate-100 px-3 py-2"><Label className="mb-0">{label}</Label></div> : null}

      <div className="space-y-1.5 border-b border-slate-200 bg-slate-50 px-2 py-2">
        <div className="flex flex-wrap items-center gap-0.5">
          <IconBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="size-4" />
          </IconBtn>
          <IconBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="size-4" />
          </IconBtn>
          <ToolbarDivider />
          <select
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
            value={currentBlock()}
            onChange={(e) => setBlock(e.target.value)}
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <ToolbarDivider />
          <IconBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="size-4" />
          </IconBtn>
          <IconBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="size-4" />
          </IconBtn>
          <IconBtn
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleMark("underline").run()}
          >
            <UnderlineIcon className="size-4" />
          </IconBtn>
          <div className="relative">
            <IconBtn title="Text color" onClick={() => colorRef.current?.click()}>
              <Baseline className="size-4" />
            </IconBtn>
            <input
              ref={colorRef}
              type="color"
              className="pointer-events-none absolute inset-0 opacity-0"
              onChange={(e) =>
                editor.chain().focus().setMark("textColor", { color: e.target.value }).run()
              }
            />
          </div>
          <ToolbarDivider />
          <IconBtn
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </IconBtn>
          <IconBtn
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </IconBtn>
        </div>

        <div className="flex flex-wrap items-center gap-0.5">
          <IconBtn
            title="Link"
            active={editor.isActive("link")}
            onClick={() => {
              const href = window.prompt("Link URL");
              if (!href) {
                editor.chain().focus().unsetMark("link").run();
                return;
              }
              editor.chain().focus().extendMarkRange("link").setMark("link", { href }).run();
            }}
          >
            <Link2 className="size-4" />
          </IconBtn>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <ImageIcon className="size-3.5" />
            {uploading ? "Uploading…" : "Embed Image"}
          </button>
          <button
            type="button"
            onClick={insertLinkEmbed}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <LinkIcon className="size-3.5" />
            Embed Link
          </button>
          <button
            type="button"
            onClick={insertVideo}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Video className="size-3.5" />
            Embed Video
          </button>
          <IconBtn title="Insert table" onClick={insertTable}>
            <TableIcon className="size-4" />
          </IconBtn>
          <ToolbarDivider />
          <IconBtn title="Align left" onClick={() => setAlign("left")}>
            <AlignLeft className="size-4" />
          </IconBtn>
          <IconBtn title="Align center" onClick={() => setAlign("center")}>
            <AlignCenter className="size-4" />
          </IconBtn>
          <IconBtn title="Align right" onClick={() => setAlign("right")}>
            <AlignRight className="size-4" />
          </IconBtn>
          <IconBtn title="Justify" onClick={() => setAlign("justify")}>
            <AlignJustify className="size-4" />
          </IconBtn>
        </div>

        <div className="flex flex-wrap items-center gap-0.5">
          <IconBtn title="Source code" active={showSource} onClick={() => (showSource ? setShowSource(false) : openSource())}>
            <Code2 className="size-4" />
          </IconBtn>
          <IconBtn title={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => setFullscreen((v) => !v)}>
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </IconBtn>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,.svg,.ico"
        className="hidden"
        onChange={(e) => void onPickImage(e.target.files?.[0])}
      />

      {showSource ? (
        <div className={`flex flex-col gap-2 p-3 ${fullscreen ? "flex-1" : minHeightClass}`}>
          <textarea
            className="min-h-[180px] flex-1 rounded-lg border border-slate-200 p-3 font-mono text-xs"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs text-white" onClick={applySource}>
              Apply HTML
            </button>
            <button type="button" className="rounded-md border px-3 py-1.5 text-xs" onClick={() => setShowSource(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${fullscreen ? "flex-1 overflow-auto" : minHeightClass} px-3 py-2 text-sm prose prose-sm max-w-none focus-within:outline-none`}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      <div className="border-t border-slate-100 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400">
        {editor.isActive("heading", { level: 1 })
          ? "h1"
          : editor.isActive("heading", { level: 2 })
            ? "h2"
            : editor.isActive("heading", { level: 3 })
              ? "h3"
              : "p"}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {fullscreen ? <div className="fixed inset-0 z-[70] bg-black/40" onClick={() => setFullscreen(false)} /> : null}
      {shell}
    </div>
  );
}

type RichTextEditorProps = {
  label?: string;
  value?: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
};

export function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: editorExtensions,
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
    extensions: editorExtensions,
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
