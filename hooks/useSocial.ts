"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialLink,
  deleteSocialLink,
  fetchSocialLinks,
  updateSocialLink,
} from "@/lib/api/social.api";
import { queryKeys } from "@/lib/query-keys";

export function useSocialLinks(location?: "hero" | "footer") {
  return useQuery({
    queryKey: [...queryKeys.socialLinks, location ?? "all"],
    queryFn: () => fetchSocialLinks(location),
  });
}

export function useCreateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSocialLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.socialLinks }),
  });
}

export function useUpdateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateSocialLink>[1] }) =>
      updateSocialLink(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.socialLinks }),
  });
}

export function useDeleteSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.socialLinks }),
  });
}
