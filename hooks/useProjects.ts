"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProjectImage,
  createProject,
  deleteProject,
  deleteProjectImage,
  fetchProject,
  fetchProjects,
  updateProject,
} from "@/api/projects.api";
import { queryKeys } from "@/lib/query-keys";

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: fetchProjects });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: queryKeys.project(id ?? ""),
    queryFn: () => fetchProject(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateProject>[1] }) =>
      updateProject(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.invalidateQueries({ queryKey: queryKeys.project(id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useAddProjectImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: Parameters<typeof addProjectImage>[1] }) =>
      addProjectImage(projectId, payload),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.project(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useDeleteProjectImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, imageId }: { projectId: string; imageId: string }) =>
      deleteProjectImage(projectId, imageId),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.project(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}
