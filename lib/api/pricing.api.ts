import { apiClient } from "./client";
import type { PricingPlan } from "@/lib/types";

export type PricingRecord = PricingPlan & { sortOrder: number; status: string };

export async function fetchPricing() {
  const { data } = await apiClient.get<PricingRecord[]>("/admin/pricing");
  return data;
}

export async function createPricingPlan(payload: Partial<PricingRecord>) {
  const { data } = await apiClient.post("/admin/pricing", payload);
  return data;
}

export async function updatePricingPlan(id: string, payload: Partial<PricingRecord>) {
  const { data } = await apiClient.put(`/admin/pricing/${id}`, payload);
  return data;
}

export async function deletePricingPlan(id: string) {
  const { data } = await apiClient.delete(`/admin/pricing/${id}`);
  return data;
}
