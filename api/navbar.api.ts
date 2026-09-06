import { apiClient } from "./client";

export type NavbarSettings = {
  id?: string;
  logoImage?: string;
  logoText?: string;
  ctaText?: string;
  ctaHref?: string;
};

export type NavbarItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  status: string;
};

export type NavbarData = {
  settings: NavbarSettings | null;
  items: NavbarItem[];
};

export async function fetchNavbar() {
  const { data } = await apiClient.get<NavbarData>("/admin/navbar");
  return data;
}

export async function updateNavbarSettings(payload: Partial<NavbarSettings> & { logoMediaId?: string }) {
  const { data } = await apiClient.put("/admin/navbar/settings", payload);
  return data;
}

export async function createNavbarItem(payload: { label: string; href: string; sortOrder?: number; status?: string }) {
  const { data } = await apiClient.post("/admin/navbar/items", payload);
  return data;
}

export async function updateNavbarItem(id: string, payload: { label: string; href: string; sortOrder?: number; status?: string }) {
  const { data } = await apiClient.put(`/admin/navbar/items/${id}`, payload);
  return data;
}

export async function deleteNavbarItem(id: string) {
  const { data } = await apiClient.delete(`/admin/navbar/items/${id}`);
  return data;
}
