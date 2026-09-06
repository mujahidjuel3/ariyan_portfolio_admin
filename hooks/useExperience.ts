"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExperienceItem,
  deleteExperienceItem,
  fetchExperience,
  updateExperienceItem,
  updateExperienceMeta,
} from "@/api/experience.api";
import { queryKeys } from "@/lib/query-keys";

export function useExperience() {
  return useQuery({ queryKey: queryKeys.experience, queryFn: fetchExperience });
}

export function useUpdateExperienceMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateExperienceMeta,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.experience }),
  });
}

export function useCreateExperienceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExperienceItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.experience }),
  });
}

export function useUpdateExperienceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateExperienceItem>[1] }) =>
      updateExperienceItem(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.experience }),
  });
}

export function useDeleteExperienceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExperienceItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.experience }),
  });
}
