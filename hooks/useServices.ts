"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createService, deleteService, fetchServices, updateService } from "@/lib/api/services.api";
import { queryKeys } from "@/lib/query-keys";

export function useServices() {
  return useQuery({ queryKey: queryKeys.services, queryFn: fetchServices });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateService>[1] }) =>
      updateService(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services }),
  });
}
