"use client";

import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/lib/api/auth.api";
import { getApiErrorMessage } from "@/helpers/api-error";
import { setToken } from "@/helpers/storage";

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => setToken(data.accessToken),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const { clearToken } = await import("@/helpers/storage");
      clearToken();
    },
  });
}

export { getApiErrorMessage };
