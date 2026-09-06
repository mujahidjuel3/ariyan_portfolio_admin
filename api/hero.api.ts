import { apiClient } from "./client";

export type HeroData = {
  id?: string;
  greeting?: string;
  name?: string;
  marqueeName?: string;
  profileImage?: string;
  profileAlt?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaIcon?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImages?: string[];
  floatingImages?: string[];
  badges?: string[];
  statistics?: Array<{ label: string; value: string }>;
};

export async function fetchHero() {
  const { data } = await apiClient.get<HeroData | null>("/admin/hero");
  return data;
}

export async function updateHero(payload: Partial<HeroData> & { profileMediaId?: string }) {
  const { data } = await apiClient.put("/admin/hero", payload);
  return data;
}
