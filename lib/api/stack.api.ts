import { apiClient } from "./client";

export type StackRecord = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  progress?: number;
  sortOrder: number;
  status: string;
};

export async function fetchStack() {
  const { data } = await apiClient.get<StackRecord[]>("/admin/stack");
  return data;
}

export async function createStackItem(payload: Partial<StackRecord> & { iconMediaId?: string }) {
  const { data } = await apiClient.post("/admin/stack", payload);
  return data;
}

export async function updateStackItem(id: string, payload: Partial<StackRecord> & { iconMediaId?: string }) {
  const { data } = await apiClient.put(`/admin/stack/${id}`, payload);
  return data;
}

export async function deleteStackItem(id: string) {
  const { data } = await apiClient.delete(`/admin/stack/${id}`);
  return data;
}
