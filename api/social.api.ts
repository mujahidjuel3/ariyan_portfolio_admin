import { apiClient } from "./client";

export type SocialLinkRecord = {
  id: string;
  label: string;
  href: string;
  platform: string;
  location: "hero" | "footer";
  sortOrder: number;
  status: string;
};

export async function fetchSocialLinks(location?: "hero" | "footer") {
  const { data } = await apiClient.get<SocialLinkRecord[]>("/admin/social-links", {
    params: location ? { location } : undefined,
  });
  return data;
}

export async function createSocialLink(payload: {
  label: string;
  href: string;
  platform: string;
  location?: "hero" | "footer";
  sortOrder?: number;
  status?: string;
}) {
  const { data } = await apiClient.post("/admin/social-links", payload);
  return data;
}

export async function updateSocialLink(id: string, payload: Partial<SocialLinkRecord>) {
  const { data } = await apiClient.put(`/admin/social-links/${id}`, payload);
  return data;
}

export async function deleteSocialLink(id: string) {
  const { data } = await apiClient.delete(`/admin/social-links/${id}`);
  return data;
}
