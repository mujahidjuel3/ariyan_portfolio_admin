"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAbout, updateAbout } from "@/lib/api/about.api";
import { queryKeys } from "@/lib/query-keys";

export function useAbout() {
  return useQuery({ queryKey: queryKeys.about, queryFn: fetchAbout });
}

export function useUpdateAbout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAbout,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.about }),
  });
}
