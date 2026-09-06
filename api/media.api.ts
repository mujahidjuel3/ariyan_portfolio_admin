import { apiClient } from "./client";

export type MediaAsset = {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  folder?: string;
  createdAt: string;
};

export async function fetchMedia() {
  const { data } = await apiClient.get<MediaAsset[]>("/admin/media");
  return data;
}

export async function uploadMedia(
  file: File,
  alt?: string,
  folder?: string,
  onProgress?: (percent: number) => void,
) {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  if (folder) form.append("folder", folder);
  const { data } = await apiClient.post<MediaAsset>("/admin/media", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}

export async function deleteMedia(id: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`/admin/media/${id}`);
  return data;
}
