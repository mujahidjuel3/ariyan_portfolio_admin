import { apiClient } from "./client";
import type { Project, ProjectBlock } from "@/lib/types";

export type ProjectRecord = Project & {
  id: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  technologies?: string[];
  status?: string;
  coverMediaId?: string;
};

export type ProjectImageRecord = {
  id: string;
  projectId: string;
  url: string;
  alt?: string;
  type: "cover" | "gallery" | "hero";
  sortOrder: number;
  mediaId?: string;
};

export async function fetchProjects() {
  const { data } = await apiClient.get<ProjectRecord[]>("/admin/projects");
  return data;
}

export async function fetchProject(id: string) {
  const { data } = await apiClient.get<ProjectRecord & { images?: ProjectImageRecord[] }>(`/admin/projects/${id}`);
  return data;
}

export async function createProject(payload: Partial<ProjectRecord> & {
  title: string;
  category: string;
  client: string;
  duration: string;
  previewHref: string;
  ctaHref: string;
  ctaLabel: string;
  summary: string;
  coverMediaId?: string;
  content?: ProjectBlock[];
}) {
  const { data } = await apiClient.post("/admin/projects", payload);
  return data;
}

export async function updateProject(id: string, payload: Partial<ProjectRecord> & { coverMediaId?: string }) {
  const { data } = await apiClient.put(`/admin/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string) {
  const { data } = await apiClient.delete(`/admin/projects/${id}`);
  return data;
}

export async function addProjectImage(projectId: string, payload: { url?: string; mediaId?: string; alt?: string; type?: string; sortOrder?: number }) {
  const { data } = await apiClient.post(`/admin/projects/${projectId}/images`, payload);
  return data;
}

export async function deleteProjectImage(projectId: string, imageId: string) {
  const { data } = await apiClient.delete(`/admin/projects/${projectId}/images/${imageId}`);
  return data;
}
