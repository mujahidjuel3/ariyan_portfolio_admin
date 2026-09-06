import axios, { AxiosHeaders } from "axios";
import { getToken } from "@/helpers/storage";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.shaarian.com";

export const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
});

apiClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers || {});
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Critical: browser must set multipart boundary itself.
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers;
  return config;
});
