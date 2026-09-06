import { apiClient } from "./client";

export type FooterSettings = {
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  copyright?: string;
};

export type FooterNavItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  status: string;
};

export type SocialLinkRecord = {
  id: string;
  label: string;
  href: string;
  platform: string;
  location: string;
  sortOrder: number;
  status: string;
};

export type FooterData = {
  settings: FooterSettings | null;
  navLinks: FooterNavItem[];
  socialLinks: SocialLinkRecord[];
};

export async function fetchFooter() {
  const { data } = await apiClient.get<FooterData>("/admin/footer");
  return data;
}

export async function updateFooterSettings(payload: Partial<FooterSettings> & { imageMediaId?: string }) {
  const { data } = await apiClient.put("/admin/footer/settings", payload);
  return data;
}

export async function createFooterNavLink(payload: { label: string; href: string; sortOrder?: number }) {
  const { data } = await apiClient.post("/admin/footer/nav-links", payload);
  return data;
}

export async function updateFooterNavLink(id: string, payload: { label: string; href: string; sortOrder?: number }) {
  const { data } = await apiClient.put(`/admin/footer/nav-links/${id}`, payload);
  return data;
}

export async function deleteFooterNavLink(id: string) {
  const { data } = await apiClient.delete(`/admin/footer/nav-links/${id}`);
  return data;
}
