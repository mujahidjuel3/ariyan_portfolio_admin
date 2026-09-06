"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNavbarItem,
  deleteNavbarItem,
  fetchNavbar,
  updateNavbarItem,
  updateNavbarSettings,
} from "@/lib/api/navbar.api";
import { queryKeys } from "@/lib/query-keys";

export function useNavbar() {
  return useQuery({ queryKey: queryKeys.navbar, queryFn: fetchNavbar });
}

export function useUpdateNavbarSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNavbarSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.navbar }),
  });
}

export function useCreateNavbarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNavbarItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.navbar }),
  });
}

export function useUpdateNavbarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateNavbarItem>[1] }) =>
      updateNavbarItem(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.navbar }),
  });
}

export function useDeleteNavbarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNavbarItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.navbar }),
  });
}
