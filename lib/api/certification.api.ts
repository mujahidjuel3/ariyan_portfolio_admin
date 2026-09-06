import { apiClient } from "./client";

export type CertificationRecord = {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  imageAlt?: string;
  sortOrder: number;
  status: string;
};

export async function fetchCertifications() {
  const { data } = await apiClient.get<CertificationRecord[]>("/admin/certifications");
  return data;
}

export async function createCertification(
  payload: Partial<CertificationRecord> & { imageMediaId?: string },
) {
  const { data } = await apiClient.post("/admin/certifications", payload);
  return data;
}

export async function updateCertification(
  id: string,
  payload: Partial<CertificationRecord> & { imageMediaId?: string },
) {
  const { data } = await apiClient.put(`/admin/certifications/${id}`, payload);
  return data;
}

export async function deleteCertification(id: string) {
  const { data } = await apiClient.delete(`/admin/certifications/${id}`);
  return data;
}
