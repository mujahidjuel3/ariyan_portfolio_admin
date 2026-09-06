import { apiClient } from "./client";

export type ServiceRecord = {
  id: string;
  number: string;
  title: string;
  description: string;
  shapeImage?: string;
  shapeAlt?: string;
  rotate?: number;
  sortOrder: number;
  status: string;
};

export async function fetchServices() {
  const { data } = await apiClient.get<ServiceRecord[]>("/admin/services");
  return data;
}

export async function createService(payload: Partial<ServiceRecord> & { shapeMediaId?: string }) {
  const { data } = await apiClient.post("/admin/services", payload);
  return data;
}

export async function updateService(id: string, payload: Partial<ServiceRecord> & { shapeMediaId?: string }) {
  const { data } = await apiClient.put(`/admin/services/${id}`, payload);
  return data;
}

export async function deleteService(id: string) {
  const { data } = await apiClient.delete(`/admin/services/${id}`);
  return data;
}
