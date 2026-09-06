"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Replace, Trash2, Loader2 } from "lucide-react";
import { Button, Label } from "@/components/ui";
import { useUploadMedia } from "@/hooks/useMedia";
import { getMutationMessage } from "@/helpers/mutation";
import { cn } from "@/lib/utils";

export type ImageUploadValue = {
  url?: string;
  mediaId?: string;
  filename?: string;
};

type ImageUploadProps = {
  label?: string;
  value?: ImageUploadValue;
  onChange: (value: ImageUploadValue) => void;
  folder?: string;
  className?: string;
};

function filenameFromUrl(url?: string, fallback?: string) {
  if (fallback) return fallback;
  if (!url) return "";
  try {
    const path = url.split("?")[0] ?? url;
    return decodeURIComponent(path.split("/").pop() || "image");
  } catch {
    return "image";
  }
}

export function ImageUpload({ label, value, onChange, folder, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [localName, setLocalName] = useState("");

  const hasImage = Boolean(value?.url);
  const displayName = filenameFromUrl(value?.url, value?.filename || localName);

  async function handleFile(file: File) {
    setError("");
    setProgress(8);
    setLocalName(file.name);
    try {
      const asset = await upload.mutateAsync({
        file,
        folder,
        alt: file.name,
        onProgress: (pct) => setProgress(Math.max(8, pct)),
      });
      setProgress(100);
      onChange({ url: asset.url, mediaId: asset.id, filename: asset.originalName || file.name });
    } catch (err) {
      setError(getMutationMessage(err, "Upload failed"));
      setProgress(0);
    } finally {
      setTimeout(() => setProgress(0), 400);
    }
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function removeImage() {
    setLocalName("");
    setError("");
    onChange({ url: "", mediaId: undefined, filename: undefined });
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/x-icon,.ico"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {!hasImage ? (
        <button
          type="button"
          onClick={openPicker}
          disabled={upload.isPending}
          className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
        >
          {upload.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Upload className="size-5" />
          )}
          <span className="font-medium">{upload.isPending ? "Uploading…" : "Upload Image"}</span>
          <span className="text-xs text-slate-400">JPG, PNG, WEBP, GIF, SVG, ICO</span>
        </button>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-900">
          <div className="relative mb-3 h-40 w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
            <Image src={value!.url!} alt={displayName || "Uploaded image"} fill className="object-contain" unoptimized />
          </div>
          {displayName ? (
            <p className="mb-3 truncate text-sm text-slate-600 dark:text-slate-300">{displayName}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={openPicker} disabled={upload.isPending}>
              <Replace className="size-4" />
              Replace
            </Button>
            <Button type="button" variant="ghost" className="text-red-600" onClick={removeImage} disabled={upload.isPending}>
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {(upload.isPending || progress > 0) && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-200"
              style={{ width: `${upload.isPending ? Math.max(progress, 12) : progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{upload.isPending ? "Uploading…" : "Upload complete"}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
