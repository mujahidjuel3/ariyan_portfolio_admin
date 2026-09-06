"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPricingPlan,
  deletePricingPlan,
  fetchPricing,
  updatePricingPlan,
} from "@/lib/api/pricing.api";
import { queryKeys } from "@/lib/query-keys";

export function usePricing() {
  return useQuery({ queryKey: queryKeys.pricing, queryFn: fetchPricing });
}

export function useCreatePricingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPricingPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pricing }),
  });
}

export function useUpdatePricingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updatePricingPlan>[1] }) =>
      updatePricingPlan(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pricing }),
  });
}

export function useDeletePricingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePricingPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pricing }),
  });
}
