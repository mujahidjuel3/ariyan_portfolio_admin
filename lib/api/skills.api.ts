import { apiClient } from "./client";

export type SkillRecord = {
  id: string;
  name: string;
  sortOrder: number;
  status: string;
};

export async function fetchSkills() {
  const { data } = await apiClient.get<SkillRecord[]>("/admin/skills");
  return data;
}

export async function createSkill(payload: { name: string; sortOrder?: number; status?: string }) {
  const { data } = await apiClient.post("/admin/skills", payload);
  return data;
}

export async function updateSkill(id: string, payload: { name: string; sortOrder?: number; status?: string }) {
  const { data } = await apiClient.put(`/admin/skills/${id}`, payload);
  return data;
}

export async function deleteSkill(id: string) {
  const { data } = await apiClient.delete(`/admin/skills/${id}`);
  return data;
}
