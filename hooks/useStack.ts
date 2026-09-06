"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStackItem, deleteStackItem, fetchStack, updateStackItem } from "@/lib/api/stack.api";
import { queryKeys } from "@/lib/query-keys";

export function useStack() {
  return useQuery({ queryKey: queryKeys.stack, queryFn: fetchStack });
}

export function useCreateStackItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStackItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stack }),
  });
}

export function useUpdateStackItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateStackItem>[1] }) =>
      updateStackItem(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stack }),
  });
}

export function useDeleteStackItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStackItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stack }),
  });
}
