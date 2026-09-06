import { apiClient } from "./client";

export type TestimonialRecord = {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar?: string;
  rating?: number;
  sortOrder: number;
  status: string;
};

export async function fetchTestimonials() {
  const { data } = await apiClient.get<TestimonialRecord[]>("/admin/testimonials");
  return data;
}

export async function createTestimonial(payload: Partial<TestimonialRecord> & { avatarMediaId?: string }) {
  const { data } = await apiClient.post("/admin/testimonials", payload);
  return data;
}

export async function updateTestimonial(id: string, payload: Partial<TestimonialRecord> & { avatarMediaId?: string }) {
  const { data } = await apiClient.put(`/admin/testimonials/${id}`, payload);
  return data;
}

export async function deleteTestimonial(id: string) {
  const { data } = await apiClient.delete(`/admin/testimonials/${id}`);
  return data;
}
