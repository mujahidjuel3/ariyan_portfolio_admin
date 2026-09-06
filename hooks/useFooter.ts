"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFooterNavLink,
  deleteFooterNavLink,
  fetchFooter,
  updateFooterNavLink,
  updateFooterSettings,
} from "@/lib/api/footer.api";
import { queryKeys } from "@/lib/query-keys";

export function useFooter() {
  return useQuery({ queryKey: queryKeys.footer, queryFn: fetchFooter });
}

export function useUpdateFooterSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateFooterSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.footer }),
  });
}

export function useCreateFooterNavLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFooterNavLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.footer }),
  });
}

export function useUpdateFooterNavLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateFooterNavLink>[1] }) =>
      updateFooterNavLink(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.footer }),
  });
}

export function useDeleteFooterNavLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFooterNavLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.footer }),
  });
}
