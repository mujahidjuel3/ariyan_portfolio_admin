"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHero, updateHero } from "@/lib/api/hero.api";
import { queryKeys } from "@/lib/query-keys";

export function useHero() {
  return useQuery({ queryKey: queryKeys.hero, queryFn: fetchHero });
}

export function useUpdateHero() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateHero,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hero }),
  });
}
