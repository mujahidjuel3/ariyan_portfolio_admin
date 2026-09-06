"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMedia, fetchMedia, uploadMedia } from "@/api/media.api";
import { queryKeys } from "@/lib/query-keys";

export function useMedia() {
  return useQuery({ queryKey: queryKeys.media, queryFn: fetchMedia });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      alt,
      folder,
      onProgress,
    }: {
      file: File;
      alt?: string;
      folder?: string;
      onProgress?: (percent: number) => void;
    }) => uploadMedia(file, alt, folder, onProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.media }),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.media }),
  });
}
