"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlogCategory,
  createBlogPost,
  deleteBlogCategory,
  deleteBlogPost,
  fetchBlogCategories,
  fetchBlogPost,
  fetchBlogPosts,
  updateBlogCategory,
  updateBlogPost,
} from "@/lib/api/blog.api";
import { queryKeys } from "@/lib/query-keys";

export function useBlogPosts() {
  return useQuery({ queryKey: queryKeys.blogPosts, queryFn: fetchBlogPosts });
}

export function useBlogPost(id: string | null) {
  return useQuery({
    queryKey: queryKeys.blogPost(id ?? ""),
    queryFn: () => fetchBlogPost(id!),
    enabled: Boolean(id),
  });
}

export function useBlogCategories() {
  return useQuery({ queryKey: queryKeys.blogCategories, queryFn: fetchBlogCategories });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogPosts }),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateBlogPost>[1] }) =>
      updateBlogPost(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.blogPosts });
      qc.invalidateQueries({ queryKey: queryKeys.blogPost(id) });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogPosts }),
  });
}

export function useCreateBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBlogCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogCategories }),
  });
}

export function useUpdateBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateBlogCategory>[1] }) =>
      updateBlogCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogCategories }),
  });
}

export function useDeleteBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogCategories }),
  });
}
