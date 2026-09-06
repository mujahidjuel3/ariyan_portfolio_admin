import { apiClient } from "./client";
import type { BlogPost, BlogCategory } from "@/lib/types";

export type BlogPostRecord = BlogPost & {
  article?: Record<string, unknown> | null;
  status?: string;
  imageMediaId?: string;
};

export async function fetchBlogPosts() {
  const { data } = await apiClient.get<BlogPostRecord[]>("/admin/blog");
  return data;
}

export async function fetchBlogPost(id: string) {
  const { data } = await apiClient.get<BlogPostRecord>(`/admin/blog/posts/${id}`);
  return data;
}

export async function createBlogPost(payload: Partial<BlogPostRecord> & {
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  author: string;
  readingTime: string;
  date: string;
  dateISO: string;
  image: string;
  imageAlt: string;
  imageMediaId?: string;
  article?: Record<string, unknown>;
}) {
  const { data } = await apiClient.post("/admin/blog/posts", payload);
  return data;
}

export async function updateBlogPost(id: string, payload: Partial<BlogPostRecord>) {
  const { data } = await apiClient.put(`/admin/blog/posts/${id}`, payload);
  return data;
}

export async function deleteBlogPost(id: string) {
  const { data } = await apiClient.delete(`/admin/blog/posts/${id}`);
  return data;
}

export async function fetchBlogCategories() {
  const { data } = await apiClient.get<BlogCategory[]>("/admin/blog/categories");
  return data;
}

export async function createBlogCategory(payload: { id: string; label: string }) {
  const { data } = await apiClient.post("/admin/blog/categories", payload);
  return data;
}

export async function updateBlogCategory(id: string, payload: { label: string }) {
  const { data } = await apiClient.put(`/admin/blog/categories/${id}`, payload);
  return data;
}

export async function deleteBlogCategory(id: string) {
  const { data } = await apiClient.delete(`/admin/blog/categories/${id}`);
  return data;
}
