"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminSettings,
  updateSectionVisibility,
  updateSiteSettings,
} from "@/api/settings.api";
import { queryKeys } from "@/lib/query-keys";

export function useSettings() {
  return useQuery({ queryKey: queryKeys.settings, queryFn: fetchAdminSettings });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
  });
}

export function useUpdateSectionVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSectionVisibility,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
  });
}
