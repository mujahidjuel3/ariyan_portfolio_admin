"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSkill, deleteSkill, fetchSkills, updateSkill } from "@/lib/api/skills.api";
import { queryKeys } from "@/lib/query-keys";

export function useSkills() {
  return useQuery({ queryKey: queryKeys.skills, queryFn: fetchSkills });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSkill,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateSkill>[1] }) =>
      updateSkill(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}
