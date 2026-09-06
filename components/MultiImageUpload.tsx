"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button, Label } from "@/components/ui";
import { useUploadMedia } from "@/hooks/useMedia";
import { getMutationMessage } from "@/helpers/mutation";
import { cn } from "@/lib/utils";

type MultiImageUploadProps = {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  className?: string;
};

export function MultiImageUpload({
  label,
  value,
  onChange,
  folder,
  className,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    setError("");
    setProgress(8);
    try {
      const asset = await upload.mutateAsync({
        file,
        folder,
        alt: file.name,
        onProgress: (pct) => setProgress(Math.max(8, pct)),
      });
      onChange([...(value ?? []), asset.url]);
      setProgress(100);
    } catch (err) {
      setError(getMutationMessage(err, "Upload failed"));
      setProgress(0);
    } finally {
      setTimeout(() => setProgress(0), 400);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label>{label}</Label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(value ?? []).map((url, index) => (
          <div key={`${url}-${index}`} className="rounded-lg border border-slate-200 p-2 dark:border-slate-600">
            <div className="relative mb-2 h-28 w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
              <Image src={url} alt="" fill className="object-cover" unoptimized />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-red-600"
              onClick={() => removeAt(index)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex h-36 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900"
        >
          {upload.isPending ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
          <span>{upload.isPending ? "Uploading…" : "Add Image"}</span>
        </button>
      </div>

      {(upload.isPending || progress > 0) && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${upload.isPending ? Math.max(progress, 12) : progress}%` }}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
