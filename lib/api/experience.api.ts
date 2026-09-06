import { apiClient } from "./client";

export type ExperienceRecord = {
  id: string;
  slug?: string;
  duration: string;
  position: string;
  company: string;
  description: string;
  logoImage?: string;
  hoverImage?: string;
  hoverImageAlt?: string;
  sortOrder: number;
  status: string;
};

export type ExperienceData = {
  cvHref: string;
  items: ExperienceRecord[];
};

export async function fetchExperience() {
  const { data } = await apiClient.get<ExperienceData>("/admin/experience");
  return data;
}

export async function updateExperienceMeta(payload: { cvHref: string }) {
  const { data } = await apiClient.put("/admin/experience/meta", payload);
  return data;
}

export async function createExperienceItem(payload: Partial<ExperienceRecord> & { logoMediaId?: string; hoverMediaId?: string }) {
  const { data } = await apiClient.post("/admin/experience/items", payload);
  return data;
}

export async function updateExperienceItem(id: string, payload: Partial<ExperienceRecord> & { logoMediaId?: string; hoverMediaId?: string }) {
  const { data } = await apiClient.put(`/admin/experience/items/${id}`, payload);
  return data;
}

export async function deleteExperienceItem(id: string) {
  const { data } = await apiClient.delete(`/admin/experience/items/${id}`);
  return data;
}
