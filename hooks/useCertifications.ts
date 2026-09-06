"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCertification,
  deleteCertification,
  fetchCertifications,
  updateCertification,
} from "@/api/certification.api";
import { queryKeys } from "@/lib/query-keys";

export function useCertifications() {
  return useQuery({ queryKey: queryKeys.certifications, queryFn: fetchCertifications });
}

export function useCreateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCertification,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.certifications }),
  });
}

export function useUpdateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateCertification>[1];
    }) => updateCertification(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.certifications }),
  });
}

export function useDeleteCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCertification,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.certifications }),
  });
}
