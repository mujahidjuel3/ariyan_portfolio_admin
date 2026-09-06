import { apiClient } from "./client";

export type ContactData = {
  id?: string;
  email?: string;
  phone?: string;
  address?: string;
  phoneHref?: string;
  emailHref?: string;
  formSettings?: Record<string, unknown>;
};

export async function fetchContact() {
  const { data } = await apiClient.get<ContactData | null>("/admin/contact");
  return data;
}

export async function updateContact(payload: ContactData) {
  const { data } = await apiClient.put("/admin/contact", payload);
  return data;
}
