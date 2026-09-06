import { getApiErrorMessage } from "@/helpers/api-error";

export function getMutationMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
