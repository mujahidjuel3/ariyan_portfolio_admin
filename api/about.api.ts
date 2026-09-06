import { apiClient } from "./client";

export type AboutData = {
  id?: string;
  heading?: string;
  text?: string;
  profileImage?: string;
  experienceYears?: number;
  features?: Array<{ title: string; description: string; icon?: string }>;
};

export async function fetchAbout() {
  const { data } = await apiClient.get<AboutData | null>("/admin/about");
  return data;
}

export async function updateAbout(payload: Partial<AboutData> & { profileMediaId?: string }) {
  const { data } = await apiClient.put("/admin/about", payload);
  return data;
}
