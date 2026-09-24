import { apiClient } from "./client";

export type PublicSettings = {
  site: {
    title: string;
    description: string;
    favicon?: string;
    faviconMediaId?: string;
    frontendTheme?: "light" | "dark";
  };
  sections: Record<string, boolean>;
  order?: string[];
};

export async function fetchSettings() {
  const { data } = await apiClient.get<PublicSettings>("/settings");
  return data;
}

export async function fetchAdminSettings() {
  const { data } = await apiClient.get<PublicSettings>("/admin/settings");
  return data;
}

export async function updateSiteSettings(payload: {
  title: string;
  description: string;
  favicon?: string;
  faviconMediaId?: string;
  frontendTheme?: "light" | "dark";
}) {
  const { data } = await apiClient.put("/admin/settings", payload);
  return data;
}

export async function updateSectionVisibility(payload: {
  sections: Record<string, boolean>;
  order?: string[];
}) {
  const { data } = await apiClient.put("/admin/settings/sections", payload);
  return data;
}
