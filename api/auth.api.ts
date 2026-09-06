import { apiClient } from "./client";

export type LoginPayload = { username: string; password: string };
export type LoginResponse = { success: boolean; accessToken: string };

export async function loginRequest(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}
