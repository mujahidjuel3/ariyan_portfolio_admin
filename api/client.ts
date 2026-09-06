import axios from "axios";
import { getToken } from "@/helpers/storage";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.shaarian.com";

export const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
